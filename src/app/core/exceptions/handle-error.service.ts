import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../features/authentication/services/auth';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class HandleErrorService implements ErrorHandler {
  serviceData: any;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NzNotificationService,
    private navigationService: NavigationService,
  ) { }

  private subject = new Subject<any>();
  isLoading = new BehaviorSubject<boolean>(false);

  lastErrorMessage: string = '';

  sendClickEvent(value: any) {
    this.serviceData = value;
    this.subject.next(value);
  }

  setLoading(val: boolean) {
    console.log('[HandleErrorService] setLoading ->', val, 'this:', this);
    this.isLoading.next(val);
  }

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  // TODO this is for all errors
  public otherError(error: any) {
    console.error("AN ERROR HAS OCCURRED");
    console.log("Code: ", error.code);
    console.log("Message: ", error.message);
    console.log("Stack: ", error.stack);

    let browser = this.checkBrowser();
    let networkType = this.checkNetworkType();
    let agentDevice = this.checkAgentDevice();
    let clientOs = this.getClientOS();


    let incident = {
      code: error.code,
      message: error.message,
      stack: error.stack,
      browser: browser,
      networkType: networkType,
      agentDevice: agentDevice,
      clientOs: clientOs,
      deviceInfo: this.getDeviceInfo()
    }
    this.logError(incident)
    this.ngZone.runOutsideAngular(() => {
      const transformedError = this.transformError(error);
      // console.log('Custom Error Handler:', transformedError);
    });
  }

  logError(request: any) {

  }

  private transformError(error: any): any {
    if (error.message && error.message.includes('NG0100')) {
      return `Custom Message: An ExpressionChangedAfterItHasBeenCheckedError occurred. ${error.message}`;
    }
    return error;
  }

  // Handling HTTP Errors using Toaster
  public handleHttpError(err: HttpErrorResponse) {
    console.log('HTTP Error: ', err);
    let errorHeader!: string;
    let errorMessage = err.error.message;
    let errorCode = err.error.statusCode;

    if (err.error instanceof ErrorEvent) {
      console.log("IN IF")
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      console.log("IN ELSE");
      console.log("ERROR STATUS: ", err.status);
      switch (err.status) {
        case 400:
          errorHeader = `Bad Request. ${err.error?.statusCode || ''}`;
          break;
        case 401:
          console.log("This is a 401 error")
          errorHeader = `Unauthorized. ${err.error?.statusCode || ''}`;
          this.authService.logout();
          break;
        case 403:
          errorHeader = `Forbidden. ${err.error?.statusCode || ''}`;
          setTimeout(() => this.router.navigateByUrl('/'), 2000);
          break;
        case 404:
          errorHeader = `Not Found. ${err.error?.statusCode || ''}`;
          break;
        case 405:
          errorHeader = `Method Not Allowed. ${err.error?.statusCode || ''}`;
          break;
        case 406:
          errorHeader = `Not Acceptable. ${err.error?.statusCode || ''}`;
          break;
        case 407:
          errorHeader = `Proxy Authentication Required. ${err.error?.statusCode || ''}`;
          break;
        case 408:
          errorHeader = `Request Timeout. ${err.error?.statusCode || ''}`;
          break;
        case 409:
          errorHeader = `Conflict. ${err.error?.statusCode || ''}`;
          break;
        case 410:
          errorHeader = `Gone. ${err.error?.statusCode || ''}`;
          break;
        case 411:
          errorHeader = `Length Required. ${err.error?.statusCode || ''}`;
          break;
        case 412:
          errorHeader = `Precondition Failed. ${err.error?.statusCode || ''}`;
          break;
        case 413:
          errorHeader = `Content Too Large. ${err.error?.statusCode || ''}`;
          break;
        case 414:
          errorHeader = `URI Too Long. ${err.error?.statusCode || ''}`;
          break;
        case 415:
          errorHeader = `Unsupported Media Type. ${err.error?.statusCode || ''}`;
          break;
        case 416:
          errorHeader = `Range Not Satisfiable. ${err.error?.statusCode || ''}`;
          break;
        case 417:
          errorHeader = `Expectation Failed. ${err.error?.statusCode || ''}`;
          break;
        case 418:
          errorHeader = `I'm a teapot 🙃. ${err.error?.statusCode || ''}`;
          break;
        case 422:
          errorHeader = `Unprocessable Content. ${err.error?.statusCode || ''}`;
          break;
        case 500:
          errorHeader = `Internal Server Error. ${err.error?.statusCode || ''}`;
          break;
        case 501:
          errorHeader = `Not Implemented. ${err.error?.statusCode || ''}`;
          break;
        case 502:
          errorHeader = `Bad Gateway. ${err.error?.statusCode || ''}`;
          break;
        case 503:
          errorHeader = `Service Unavailable. ${err.error?.statusCode || ''}`;
          break;
        case 504:
          errorHeader = `Gateway Timeout. ${err.error?.statusCode || ''}`;
          break;
        default:
          errorHeader = `Error. ${err.error?.statusCode || ''}`;
      }
    }
    this.notificationService.create('error', errorHeader, errorMessage, { nzDuration: 5000 });

    this.setLoading(false);
    if (errorMessage && errorMessage !== this.lastErrorMessage) {
      this.lastErrorMessage = errorMessage;
      console.log(errorMessage);
    }
  }

  // Implement ErrorHandler interface method
  handleError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.otherError(error);
    }
  }

  checkBrowser(): { name: string, version: string } {
    const windowAny = window as any; // Type assertion to 'any' to bypass type checking
    const userAgent = navigator.userAgent;
    let temp;
    let match;

    const isOpera = (!!windowAny.opr && !!windowAny.opr.addons) || !!windowAny.opera || userAgent.indexOf('OPR/') >= 0;
    const isFirefox = typeof windowAny.InstallTrigger !== 'undefined';
    const isSafari = /constructor/i.test(windowAny.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!windowAny['safari'] || windowAny.safari.pushNotification);
    const isIE = /*@cc_on!@*/!!document.DOCUMENT_NODE;
    const isEdge = !isIE && !!windowAny.StyleMedia;
    const isChrome = !!windowAny.chrome && (!!windowAny.chrome.webstore || !!windowAny.chrome.runtime);
    const isBlink = (isChrome || isOpera) && !!windowAny.CSS;

    if (isFirefox) {
      match = userAgent.match(/Firefox\/(\d+)/);
      return { name: 'Firefox', version: match ? match[1] : 'unknown' };
    }
    if (isChrome) {
      match = userAgent.match(/Chrome\/(\d+)/);
      return { name: 'Chrome', version: match ? match[1] : 'unknown' };
    }
    if (isSafari) {
      match = userAgent.match(/Version\/(\d+).(\d+)/);
      return { name: 'Safari', version: match ? `${match[1]}.${match[2]}` : 'unknown' };
    }
    if (isOpera) {
      match = userAgent.match(/OPR\/(\d+)/);
      return { name: 'Opera', version: match ? match[1] : 'unknown' };
    }
    if (isIE) {
      match = userAgent.match(/MSIE (\d+)/) || userAgent.match(/rv:(\d+)/);
      return { name: 'IE', version: match ? match[1] : 'unknown' };
    }
    if (isEdge) {
      match = userAgent.match(/Edge\/(\d+)/);
      return { name: 'Edge', version: match ? match[1] : 'unknown' };
    }
    if (isBlink) {
      match = userAgent.match(/Chrome\/(\d+)/);
      return { name: 'Blink', version: match ? match[1] : 'unknown' };
    }

    return { name: 'Other', version: 'unknown' };
  }

  checkNetworkType() {
    // @ts-ignore
    var networkState = navigator['connection'].effectiveType
    return networkState
  }


  checkAgentDevice() {
    const ua = navigator.userAgent;

    if (/Macintosh/i.test(ua)) {
      return 'MacBook';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      return 'iPhone';
    } else if (/Android/i.test(ua)) {
      return 'Android';
    } else if (/Windows|Linux|Ubuntu/i.test(ua)) {
      return 'Desktop';
    } else {
      return 'Other';
    }
  }

  getClientOS(): { name: string, version: string } {
    const userAgent = navigator.userAgent;
    let osName = 'Unknown OS';
    let osVersion = 'Unknown Version';

    if (/Windows NT 10.0/.test(userAgent)) {
      osName = 'Windows';
      osVersion = '10';
    } else if (/Windows NT 6.3/.test(userAgent)) {
      osName = 'Windows';
      osVersion = '8.1';
    } else if (/Windows NT 6.2/.test(userAgent)) {
      osName = 'Windows';
      osVersion = '8';
    } else if (/Windows NT 6.1/.test(userAgent)) {
      osName = 'Windows';
      osVersion = '7';
    } else if (/Windows NT 6.0/.test(userAgent)) {
      osName = 'Windows';
      osVersion = 'Vista';
    } else if (/Windows NT 5.1/.test(userAgent)) {
      osName = 'Windows';
      osVersion = 'XP';
    } else if (/Windows NT 5.0/.test(userAgent)) {
      osName = 'Windows';
      osVersion = '2000';
    } else if (/Mac OS X/.test(userAgent)) {
      osName = 'Mac OS';
      osVersion = /Mac OS X (\d+[._]\d+([._]\d+)?)/.exec(userAgent)?.[1] ?? 'Unknown Version';
    } else if (/Android/.test(userAgent)) {
      osName = 'Android';
      osVersion = /Android (\d+[._]\d+([._]\d+)?)/.exec(userAgent)?.[1] ?? 'Unknown Version';
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      osName = 'iOS';
      osVersion = /OS (\d+[._]\d+([._]\d+)?)/.exec(userAgent)?.[1].replace(/_/g, '.') ?? 'Unknown Version';
    } else if (/Linux/.test(userAgent)) {
      osName = 'Linux';
      // Optional: Add more specific detection for Linux distributions if needed
      osVersion = 'Unknown Version';
    }

    return { name: osName, version: osVersion };
  }

  getDeviceInfo(): { brand: string, model: string, family: string } {
    const userAgent = navigator.userAgent;
    let brand = 'Unknown Brand';
    let model = 'Unknown Model';
    let family = 'Unknown Family';

    // Apple Devices
    if (/iPhone/.test(userAgent)) {
      brand = 'Apple';
      model = 'iPhone';
      family = 'iPhone';
    } else if (/iPad/.test(userAgent)) {
      brand = 'Apple';
      model = 'iPad';
      family = 'iPad';
    } else if (/Macintosh|Mac OS X/.test(userAgent)) {
      brand = 'Apple';
      model = 'Mac';
      family = 'Mac';
    }

    // Android Devices
    else if (/Android/.test(userAgent)) {
      brand = 'Android';
      model = 'Unknown Model'; // Model detection for Android is more complex
      family = 'Android';
      const androidMatch = userAgent.match(/Android (\d+\.\d+)/);
      if (androidMatch) {
        model = `Android ${androidMatch[1]}`;
      }
    }

    // Windows Devices
    else if (/Windows/.test(userAgent)) {
      brand = 'Microsoft';
      model = 'Windows PC';
      family = 'Windows';
    }

    // Linux Devices
    else if (/Linux/.test(userAgent)) {
      brand = 'Linux';
      model = 'Linux PC';
      family = 'Linux';
    }

    // Add more device detection logic as needed

    return { brand, model, family };
  }

}
