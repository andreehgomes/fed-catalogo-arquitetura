import { HttpClient, provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";

import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { getDatabase, provideDatabase } from "@angular/fire/database";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { getStorage, provideStorage } from "@angular/fire/storage";
import { getAnalytics, provideAnalytics } from "@angular/fire/analytics";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { withNgxsStoragePlugin } from "@ngxs/storage-plugin";
import { provideStore } from "@ngxs/store";
import { provideAngularSvgIcon } from "angular-svg-icon";
import { provideToastr } from "ngx-toastr";

import { environment } from "../environments/environment";
import { routes } from "./app.routes";
import { CategoryState } from "./shared/store/states/category.state";
import { CompareState } from "./shared/store/states/compare.state";
import { PropertyState } from "./shared/store/states/property-detail.state";
import { ImageState } from "./shared/store/states/property-images.state";
import { WishlistState } from "./shared/store/states/wishlist.state";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideAngularSvgIcon(),
    provideToastr(),
    // Firebase providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics()),
    // NGXS State Management
    provideStore(
      [WishlistState, CategoryState, CompareState, ImageState, PropertyState],
      withNgxsStoragePlugin({
        keys: ["wishlist", "compare"],
      }),
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
  ],
};
