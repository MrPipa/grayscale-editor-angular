import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GrayScaleImage } from './models/grayscale-image';

@Injectable({
  providedIn: 'root',
})
export class NeuralService {
  constructor(private _httpClient: HttpClient) {}

  read(grayscaleImage: GrayScaleImage): Observable<string> {
    //return of('2');
    return this._httpClient.post<string>(
      'https://localhost:5001/read',
      grayscaleImage
    );
  }
}
