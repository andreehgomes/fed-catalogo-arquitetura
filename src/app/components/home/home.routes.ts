import { Routes } from "@angular/router";

import { Classic } from "./classic/classic";
import { Corporate } from "./corporate/corporate";
import { Enterprise } from "./enterprise/enterprise";
import { ImageContent } from "./image-content/image-content";
import { MapHSearch } from "./map-h-search/map-h-search";
import { MapVSearch } from "./map-v-search/map-v-search";
import { Modern } from "./modern/modern";
import { ModernVideo } from "./modern-video/modern-video";
import { ParallaxImage } from "./parallax-image/parallax-image";
import { SearchTab } from "./search-tab/search-tab";
import { SliderFilterSearch } from "./slider-filter-search/slider-filter-search";
import { TypedImage } from "./typed-image/typed-image";

export default [
  {
    path: "slider-filter-search",
    component: SliderFilterSearch,
  },
  {
    path: "corporate",
    component: Corporate,
  },
  {
    path: "classic",
    component: Classic,
  },
  {
    path: "enterprise",
    component: Enterprise,
  },
  {
    path: "image-content",
    component: ImageContent,
  },
  {
    path: "modern",
    component: Modern,
  },
  {
    path: "parallax-image",
    component: ParallaxImage,
  },
  {
    path: "search-tab",
    component: SearchTab,
  },
  {
    path: "typed-image",
    component: TypedImage,
  },
  {
    path: "morden-video",
    component: ModernVideo,
  },
  {
    path: "map-v-search",
    component: MapVSearch,
  },
  {
    path: "map-h-search",
    component: MapHSearch,
  },
] as Routes;
