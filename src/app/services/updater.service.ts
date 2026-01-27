import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';

type GithubAsset = {
  name: string;
  size: number;
  browser_download_url: string;
};

type GithubRelease = {
  tag_name: string;
  assets: GithubAsset[];
};

@Injectable({ providedIn: 'root' })
export class UpdaterService {
  private readonly GITHUB_REPO = 'networked-ai';
  private readonly GITHUB_OWNER = 'freelancework00700';

  private http = inject(HttpClient);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  private isDownloading = false;
  private listenersAdded = false;
  private activeLoading?: HTMLIonLoadingElement;

  /**
   * Call once on app start (native only).
   * - Notifies Capgo that the app is ready
   * - Checks GitHub Releases for a newer build.zip
   */
  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    this.addCapgoListenersOnce();

    try {
      await CapacitorUpdater.notifyAppReady();
    } catch (error) {
      console.error('CapacitorUpdater.notifyAppReady failed:', error);
    }

    await this.checkForUpdates({ interactive: false });
  }

  /**
   * Manual trigger (hook this to a settings button if you want).
   */
  async checkForUpdatesManually(): Promise<void> {
    await this.checkForUpdates({ interactive: true });
  }

  private async checkForUpdates({ interactive }: { interactive: boolean }): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      if (interactive) {
        await this.showToast('Live updates are only available on a native build.');
      }
      return;
    }

    const release = await this.getLatestRelease();
    if (!release) {
      if (interactive) await this.showToast('Failed to fetch latest release.');
      return;
    }

    const buildAsset = release.assets.find((a) => a.name === 'build.zip');
    if (!buildAsset) {
      if (interactive) await this.showToast('No build.zip found in the latest GitHub release.');
      return;
    }

    const currentVersion = await this.getCurrentAppVersion();
    const nextVersion = release.tag_name;

    if (currentVersion && currentVersion === nextVersion) {
      if (interactive) await this.showToast('You are already on the latest version.');
      return;
    }

    // show prompt and (if accepted) download + apply
    await this.promptAndUpdate({
      tag: nextVersion,
      sizeBytes: buildAsset.size,
      url: buildAsset.browser_download_url
    });
  }

  private async promptAndUpdate(info: { tag: string; sizeBytes: number; url: string }): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Update available',
      message: `Version: <strong>${info.tag}</strong><br/>Size: <strong>${this.formatFileSize(info.sizeBytes)}</strong>`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Download',
          role: 'confirm',
          handler: () => this.startDownload(info)
        }
      ]
    });

    await alert.present();
  }

  private async startDownload(info: { tag: string; url: string }): Promise<void> {
    if (this.isDownloading) return;
    this.isDownloading = true;

    const loading = await this.loadingCtrl.create({
      message: 'Preparing download…',
      backdropDismiss: false
    });
    await loading.present();
    this.activeLoading = loading;

    try {
      const version = await CapacitorUpdater.download({
        url: info.url,
        version: info.tag
      });

      if (!version) {
        throw new Error('Download returned no version');
      }

      this.setLoadingMessage('Download complete! Applying update…');
      await CapacitorUpdater.set(version);

      await loading.dismiss();
      await this.showToast('Update applied. Reloading…');
      window.location.reload();
    } catch (error) {
      console.error('Update download/apply failed:', error);
      await loading.dismiss();
      await this.showToast(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.activeLoading = undefined;
      this.isDownloading = false;
    }
  }

  private async getLatestRelease(): Promise<GithubRelease | null> {
    try {
      const url = `https://api.github.com/repos/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/releases/latest`;
      return await firstValueFrom(this.http.get<GithubRelease>(url));
    } catch (error) {
      console.error('Failed to fetch latest GitHub release:', error);
      return null;
    }
  }

  private async getCurrentAppVersion(): Promise<string | null> {
    try {
      const { bundle } = await CapacitorUpdater.current();
      const version = bundle?.version;
      if (!version || version === 'builtin') return null;
      return version;
    } catch (error) {
      console.log('Could not get current bundle version:', error);
      return null;
    }
  }

  private addCapgoListenersOnce(): void {
    if (this.listenersAdded) return;
    this.listenersAdded = true;

    CapacitorUpdater.addListener('download', (info: { percent: number }) => {
      const pct = Math.max(0, Math.min(100, info.percent ?? 0));
      this.setLoadingMessage(`Downloading… ${Math.round(pct)}%`);
    });

    CapacitorUpdater.addListener('downloadFailed', (err: any) => {
      console.error('Download failed:', err);
    });

    CapacitorUpdater.addListener('updateFailed', (err: any) => {
      console.error('Update failed:', err);
    });
  }

  private formatFileSize(bytes: number): string {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private setLoadingMessage(message: string): void {
    // Ionic overlays allow setting properties after present()
    const loading = this.activeLoading;
    if (!loading) return;
    loading.message = message;
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom'
    });
    await toast.present();
  }
}

