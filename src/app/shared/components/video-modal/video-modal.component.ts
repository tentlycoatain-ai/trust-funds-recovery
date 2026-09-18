import { Component, Input, Output, EventEmitter, HostListener, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-modal.component.html',
  styleUrls: ['./video-modal.component.scss']
})
export class VideoModalComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = 'Trust Funds Recovery — Strategic Corporate Overview';
  @Input() subtitle = 'Watch how our forensic specialists assess, document, and navigate recovery cases.';
  @Input() videoSrc = '';
  @Output() close = new EventEmitter<void>();

  @ViewChild('cinematicCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  isPlaying = signal<boolean>(true);
  isMuted = signal<boolean>(false);
  progressPercent = signal<number>(32);
  currentTimeStr = signal<string>('01:14');
  durationStr = signal<string>('03:45');

  private animationFrameId?: number;
  private progressInterval?: any;
  private canvasTime = 0;

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  ngAfterViewInit(): void {
    this.startCanvasAnimation();
    this.startProgressSimulation();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  togglePlay(): void {
    this.isPlaying.update(p => !p);
  }

  toggleMute(): void {
    this.isMuted.update(m => !m);
  }

  onClose(): void {
    this.close.emit();
  }

  private startProgressSimulation(): void {
    let currentSeconds = 74;
    const totalSeconds = 225;

    this.progressInterval = setInterval(() => {
      if (this.isPlaying() && this.isOpen) {
        currentSeconds = (currentSeconds + 1) % totalSeconds;
        const mins = Math.floor(currentSeconds / 60);
        const secs = currentSeconds % 60;
        this.currentTimeStr.set(`0${mins}:${secs < 10 ? '0' : ''}${secs}`);
        this.progressPercent.set((currentSeconds / totalSeconds) * 100);
      }
    }, 1000);
  }

  private startCanvasAnimation(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      this.canvasTime += 0.02;
      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 450);

      // Deep cinematic gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
      bgGrad.addColorStop(0, '#0F2347');
      bgGrad.addColorStop(0.6, '#0A1128');
      bgGrad.addColorStop(1, '#050A18');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Dynamic network grid nodes
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Flowing nodes / data telemetry
      const nodeCount = 12;
      for (let i = 0; i < nodeCount; i++) {
        const angle = this.canvasTime * 0.4 + (i * Math.PI * 2) / nodeCount;
        const radius = 120 + Math.sin(this.canvasTime + i) * 35;
        const nx = width / 2 + Math.cos(angle) * radius * 1.5;
        const ny = height / 2 + Math.sin(angle) * radius;

        // Connections to center
        ctx.strokeStyle = 'rgba(197, 168, 128, 0.2)';
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#60A5FA' : '#C5A880';
        ctx.fill();
      }

      // Center security core
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 48, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 58, 138, 0.4)';
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Pulsing outer ring
      const pulseRadius = 55 + Math.sin(this.canvasTime * 2) * 6;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(197, 168, 128, 0.45)';
      ctx.stroke();

      if (this.isOpen) {
        this.animationFrameId = requestAnimationFrame(render);
      }
    };

    render();
  }
}
