import { Component } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

@Component({
  selector: 'nerd-breadcrumb',
  standalone: false,
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {

  breadcrumbs: string[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.createBreadcrumb(this.route.root);
    });
  }

  // private createBreadcrumb(route: ActivatedRoute, url: string = '', breadcrumbs: string[] = []): string[] {
  //   const children = route.children;
  //   if (children.length === 0) return breadcrumbs;
  //
  //   for (const child of children) {
  //     const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
  //     if (routeURL !== '') url += `/${routeURL}`;
  //
  //     if (child.snapshot.data['breadcrumb']) {
  //       breadcrumbs.push(child.snapshot.data['breadcrumb']);
  //     }
  //
  //     return this.createBreadcrumb(child, url, breadcrumbs);
  //   }
  //
  //   return breadcrumbs;
  // }

  // private createBreadcrumb(route: ActivatedRoute, url: string = '', breadcrumbs: string[] = []): string[] {
  //   const children = route.children;
  //   if (children.length === 0) return breadcrumbs;
  //
  //   for (const child of children) {
  //     const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
  //     if (routeURL !== '') url += `/${routeURL}`;
  //
  //     let label = child.snapshot.data['breadcrumb'];
  //     if (label) {
  //       // Replace any :param with actual value
  //       Object.keys(child.snapshot.params).forEach(param => {
  //         label = label.replace(`:${param}`, child.snapshot.params[param]);
  //       });
  //       breadcrumbs.push(label);
  //     }
  //
  //     return this.createBreadcrumb(child, url, breadcrumbs);
  //   }
  //
  //   return breadcrumbs;
  // }

  private createBreadcrumb(route: ActivatedRoute, url: string = '', breadcrumbs: string[] = []): string[] {
    const children = route.children;
    if (children.length === 0) return breadcrumbs;

    for (const child of children) {
      const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') url += `/${routeURL}`;

      let label = child.snapshot.data['breadcrumb'];
      if (label) {
        // Replace :param with actual value
        Object.keys(child.snapshot.params).forEach(param => {
          label = label.replace(`:${param}`, child.snapshot.params[param]);
        });
        // Split by / and push each segment separately
        label.split('/').forEach((segment: any) => breadcrumbs.push(segment));
      }

      return this.createBreadcrumb(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }


}
