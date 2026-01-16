import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface GenerateEventDescriptionRequest {
  event: {
    title?: string;
    category?: string;
    location?: string;
    address?: string;
    dates?: Array<{
      start?: string;
      end?: string;
    }>;
  };
  zonedStartTime?: string;
  zonedEndTime?: string;
}

export interface GenerateTicketDescriptionRequest {
  ticketName?: string;
  ticketType?: string;
  price?: string;
  quantity?: number | string;
  eventDate?: string;
  eventStartTime?: string;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable({ providedIn: 'root' })
export class DescriptionGeneratorService {
  private http = inject(HttpClient);

  /**
   * Generate event description using OpenAI API
   * @param data Event data and timezone information
   * @returns Generated description from AI
   */
  async generateEventDescription(data: GenerateEventDescriptionRequest): Promise<string> {
    try {
      if (!data.event) {
        throw new Error('Event data is required.');
      }

      // Build the prompt similar to Firebase function
      const { event, zonedStartTime, zonedEndTime } = data;
      
      // Build prompt parts, excluding 'TBD' values
      const promptParts: string[] = [];
      
      if (event.title && event.title !== 'TBD') {
        promptParts.push(`title=${event.title}`);
      }
      if (event.category && event.category !== 'TBD') {
        promptParts.push(`category=${event.category}`);
      }
      if (event.location && event.location !== 'TBD') {
        promptParts.push(`venueName=${event.location}`);
      }
      if (event.address && event.address !== 'TBD') {
        promptParts.push(`venueAddress=${event.address}`);
      }
      if (zonedStartTime && zonedStartTime !== 'TBD') {
        promptParts.push(`startTime=${zonedStartTime}`);
      }
      if (zonedEndTime && zonedEndTime !== 'TBD') {
        promptParts.push(`endTime=${zonedEndTime}`);
      }

      const prompt = `Generate a brief description of an event for an online listing based on the following event details: ${promptParts.join('; ')}. If a value is 'TBD', that indicates that that specific parameter has not be defined yet, so leave that event parameter and its value out of the description entirely. Decorate with a couple of related emoji's and make sure it is easy to read, with paragraph breaks between the main sections, and maximizes attendance.`;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${environment.openaiKey}`
      });

      const messages: OpenAIMessage[] = [
        {
          role: 'user',
          content: prompt
        }
      ];

      const result = await firstValueFrom(
        this.http.post<OpenAIResponse>(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 4000
          },
          { headers }
        )
      );

      if (result?.choices?.[0]?.message?.content) {
        // Replace width attributes in HTML if present
        const description = result.choices[0].message.content.replace(/width="\d+"/, 'width="100%"');
        return description;
      }

      throw new Error('No description generated from AI');
    } catch (error: any) {
      console.error('Error generating event description:', error);
      
      if (error?.error?.error?.message) {
        throw new Error(error.error.error.message);
      }

      throw new Error(error?.message || 'Failed to generate event description. Please try again.');
    }
  }

  /**
   * Generate ticket description using OpenAI API
   * @param data Ticket data and event information
   * @returns Generated description from AI
   */
  async generateTicketDescription(data: GenerateTicketDescriptionRequest): Promise<string> {
    try {
      const { ticketName, ticketType, price, quantity, eventDate, eventStartTime } = data;

      // Build ticket-specific prompt
      const promptParts: string[] = [];
      
      if (ticketName && ticketName !== 'TBD') {
        promptParts.push(`ticketName=${ticketName}`);
      }
      if (ticketType) {
        promptParts.push(`ticketType=${ticketType}`);
      }
      if (price && price !== '0.00' && price !== 'TBD') {
        promptParts.push(`price=$${price}`);
      }
      if (quantity) {
        promptParts.push(`quantity=${quantity}`);
      }
      if (eventDate && eventDate !== 'TBD') {
        promptParts.push(`eventDate=${eventDate}`);
      }
      if (eventStartTime && eventStartTime !== 'TBD') {
        promptParts.push(`eventStartTime=${eventStartTime}`);
      }

      // Build prompt for ticket description - keep it short (2-3 lines)
      const prompt = `Generate a very brief and compelling description (2-3 lines only) for a ${ticketType || 'ticket'}${ticketName ? ` named "${ticketName}"` : ''}${price && price !== '0.00' ? ` priced at $${price}` : ' (Free ticket)'}${quantity ? ` with ${quantity} available tickets` : ''}. Make it concise, engaging, and highlight the key value. Include 1-2 relevant emoji's. Keep it to maximum 3 short lines.`;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${environment.openaiKey}`
      });

      const messages: OpenAIMessage[] = [
        {
          role: 'user',
          content: prompt
        }
      ];

      const result = await firstValueFrom(
        this.http.post<OpenAIResponse>(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150
          },
          { headers }
        )
      );

      if (result?.choices?.[0]?.message?.content) {
        // Replace width attributes in HTML if present
        const description = result.choices[0].message.content.replace(/width="\d+"/, 'width="100%"');
        return description;
      }

      throw new Error('No description generated from AI');
    } catch (error: any) {
      console.error('Error generating ticket description:', error);
      
      if (error?.error?.error?.message) {
        throw new Error(error.error.error.message);
      }

      throw new Error(error?.message || 'Failed to generate ticket description. Please try again.');
    }
  }
}
