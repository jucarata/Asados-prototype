export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
  /** object-position CSS for portrait crop of landscape food shots */
  position?: string;
};

/** Fotos del home que rotan para antojar antes del menú. */
export const heroSlides: HeroSlide[] = [
  {
    id: "churrasco",
    src: "/images/hero/churrasco.jpg",
    alt: "Churrasco a la parrilla, jugoso y con chimichurri",
    position: "center 35%",
  },
  {
    id: "pizza",
    src: "/images/hero/pizza.jpg",
    alt: "Pizza con queso derretido recién salida del horno",
    position: "center 40%",
  },
  {
    id: "hamburguesa",
    src: "/images/hero/hamburguesa.png",
    alt: "Hamburguesa doble con tocineta, queso y papas fritas",
    position: "center 45%",
  },
  {
    id: "lasana",
    src: "/images/hero/lasana.png",
    alt: "Porción de lasaña gratinada con salsa y queso",
    position: "center 40%",
  },
  {
    id: "bandeja-paisa",
    src: "/images/hero/bandeja-paisa.jpg",
    alt: "Bandeja paisa con frijoles, chicharrón, huevo y arepa",
    position: "center 35%",
  },
];
