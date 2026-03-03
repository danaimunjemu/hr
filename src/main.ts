import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import html2canvas from 'html2canvas';
// @ts-ignore
import { Canvg } from 'canvg';
import DOMPurify from 'dompurify';

(window as any).html2canvas = html2canvas;
(window as any).canvg = Canvg;
(window as any).dompurify = DOMPurify;

platformBrowser().bootstrapModule(AppModule, {

})
  .catch(err => console.error(err));
