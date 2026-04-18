import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

// Menu
export interface IMenu {
  items?: IMenu[];
  path?: string;
  title?: string;
  icon?: string;
  type?: string;
  megaMenu?: boolean;
  image?: string;
  active?: boolean;
  badge?: boolean;
  badgeText?: string;
  badgeIcon?: boolean;
  children?: IMenu[];
  level?: number;
  section?: IMenu[];
  right?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class NavService {
  public MENUITEMS: IMenu[] = [
    {
      title: "home",
      icon: "home",
      type: "link",
      path: "/",
      active: false,
      level: 1,
    },
  ];

  items = new BehaviorSubject<IMenu[]>(this.MENUITEMS);
}
