import { Component, ElementRef, ViewChild } from '@angular/core';
import { GrayScaleImage } from './models/grayscale-image';
import { Point } from './models/point';
import { NeuralService } from './neural.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  verticalResolution: number = 28;
  horizontalResolution: number = 28;
  scale: number = 10;

  result: string | null = null;
  error: string | null = null;

  private _2dContext: CanvasRenderingContext2D;
  private _previous: Point | null = null;
  private _current: Point | null = null;
  private _lineWidth: number = 1.5;

  constructor(private _neuralService: NeuralService) {}

  @ViewChild('canvas') private _canvas: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this._2dContext = this._canvas.nativeElement.getContext('2d');
    this._2dContext.fillStyle = 'black';
    this._2dContext.fillRect(
      0,
      0,
      this.horizontalResolution,
      this.verticalResolution
    );
  }

  down(event: MouseEvent) {
    this.updatePositionAndDraw(event);
  }

  move(event: MouseEvent) {
    if (event.buttons === 1) {
      this.updatePositionAndDraw(event);
    }
  }

  up(event: MouseEvent) {
    this._previous = this._current = null;
  }

  leave(event: MouseEvent) {
    if (event.buttons === 1) {
      this.updatePositionAndDraw(event);
      this._previous = this._current = null;
    }
  }

  enter(event: MouseEvent) {
    if (event.buttons === 1) {
      this.updatePositionAndDraw(event);
    }
  }

  updatePositionAndDraw(mouseEvent: MouseEvent) {
    this._previous = this._current;
    this._current = {
      x:
        (mouseEvent.clientX - this._canvas.nativeElement.offsetLeft) /
        this.scale,
      y:
        (mouseEvent.clientY - this._canvas.nativeElement.offsetTop) /
        this.scale,
    };

    if (this._current !== null) {
      if (this._previous !== null) {
        this._2dContext.beginPath();
        this._2dContext.moveTo(this._previous.x, this._previous.y);
        this._2dContext.lineTo(this._current.x, this._current.y);
        this._2dContext.strokeStyle = 'white';
        this._2dContext.lineWidth = this._lineWidth;
        this._2dContext.lineCap = 'round';
        this._2dContext.stroke();
        this._2dContext.closePath();
      } else {
        this._2dContext.beginPath();
        this._2dContext.fillStyle = 'white';
        //this._2dContext.beginPath();
        this._2dContext.lineWidth = 0;
        this._2dContext.arc(
          this._current.x,
          this._current.y,
          this._lineWidth / 4,
          0,
          2 * Math.PI,
          false
        );
        this._2dContext.fillStyle = 'white';
        this._2dContext.fill();
        this._2dContext.lineWidth = this._lineWidth;
        this._2dContext.strokeStyle = '#FFFFFF';
        this._2dContext.stroke();

        /*
        this._2dContext.fillStyle="circle";
        this._2dContext.fill(
          this._current.x - 3,
          this._current.y - 3,
          6,
          6
        );*/
        this._2dContext.closePath();
        this._2dContext.fillStyle = 'black';
      }
    }
  }

  read() {
    // Read canvas
    var imageData = this._2dContext.getImageData(
      0,
      0,
      this.horizontalResolution,
      this.verticalResolution
    );

    // Read alpha from image-data
    let imageAlpha = [];
    for (let i = 3; i < imageData.data.length; i += 4) {
      imageAlpha = [...imageAlpha, imageData.data[i]];
      if (imageData.data[i] != 255) {
        console.log('This program is sane');
      }
    }
    console.log(imageAlpha);

    let grayScaleImage = {
      data: imageAlpha,
      width: this.horizontalResolution,
      height: this.verticalResolution,
    } as GrayScaleImage;

    this._neuralService.read(grayScaleImage).subscribe({
      next: (result) => {
        this.error = null;
        this.result = result;
        console.log(result);
      },
      error: (error) => {
        this.result = null;
        this.error = error.message;
        console.error(error);
      },
      complete: () => {},
    });
  }

  clear() {
    this._2dContext.fillStyle = 'black';
    this._2dContext.fillRect(
      0,
      0,
      this.horizontalResolution,
      this.verticalResolution
    );
  }
}
