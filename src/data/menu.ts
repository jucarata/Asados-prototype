import { withBase } from "../lib/base";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** Precio en COP. */
  price: number;
  categoryId: string;
  accent: string;
  /** Foto del plato; si falta, se resuelve por categoría / id o el placeholder. */
  image?: string;
};

const PLACEHOLDER_IMAGE = "/images/dish-placeholder.png";

/** Fotos reales en public/images/hero, reutilizadas en el menú del MVP. */
const ITEM_IMAGES: Record<string, string> = {
  "res-churrasco": "/images/hero/churrasco.jpg",
  "alm-bandeja-paisa": "/images/hero/bandeja-paisa.jpg",
  "combo-hamburguesa": "/images/hero/hamburguesa.png",
  "combo-pizza": "/images/hero/pizza.jpg",
  "rap-burger-sencilla": "/images/hero/hamburguesa.png",
  "rap-burger-especial": "/images/hero/hamburguesa.png",
  "rap-burger-doble": "/images/hero/hamburguesa.png",
};

const CATEGORY_IMAGES: Record<string, string> = {
  pizzas: "/images/hero/pizza.jpg",
  lasanas: "/images/hero/lasana.png",
};

export type MenuCategory = {
  id: string;
  name: string;
  /** Horario u otra nota corta bajo el título de sección. */
  note?: string;
};

export const categories: MenuCategory[] = [
  { id: "desayunos", name: "Desayunos", note: "6:00 a. m. – 11:00 a. m." },
  { id: "almuerzos", name: "Almuerzos", note: "11:00 a. m. – 6:00 p. m." },
  { id: "ejecutivo", name: "Ejecutivo", note: "11:00 a. m. – 6:00 p. m." },
  { id: "combos", name: "Combos" },
  { id: "entradas", name: "Entradas" },
  { id: "cerdo-pollo", name: "Cerdo y pollo", note: "250 g, con arroz y papa salada" },
  { id: "res", name: "Res", note: "250 g, con arroz y papa salada (excepto mixtos)" },
  { id: "pizzas", name: "Pizzas" },
  { id: "lasanas", name: "Lasañas" },
  { id: "rapidas", name: "Rápidas" },
  { id: "bebidas", name: "Bebidas" },
];

/** Catálogo real ASADOS 24/7. Pizzas personal/mediana van como ítems separados para el pedido. */
export const items: MenuItem[] = [
  // —— Desayunos (4) ——
  {
    id: "des-arroz-huevo",
    name: "Arroz o calentado con huevo",
    description: "Desayuno clásico con huevo.",
    price: 15000,
    categoryId: "desayunos",
    accent: "#C4A574",
  },
  {
    id: "des-arroz-filete",
    name: "Arroz o calentado con filete o lomo",
    description: "Con filete o lomo a la parrilla.",
    price: 15000,
    categoryId: "desayunos",
    accent: "#8B4518",
  },
  {
    id: "des-omelette",
    name: "Omelette",
    description: "Omelette del día.",
    price: 15000,
    categoryId: "desayunos",
    accent: "#F2A541",
  },
  {
    id: "des-consome-arroz",
    name: "Consomé, arroz y proteína",
    description: "Consomé con arroz y proteína.",
    price: 15000,
    categoryId: "desayunos",
    accent: "#6B4226",
  },

  // —— Almuerzos especiales (4) ——
  {
    id: "alm-frijolada",
    name: "Frijolada con chicharrón",
    description: "Frijolada especial con chicharrón.",
    price: 34000,
    categoryId: "almuerzos",
    accent: "#7D1D1F",
  },
  {
    id: "alm-bandeja-paisa",
    name: "Bandeja Paisa",
    description: "La clásica bandeja paisa.",
    price: 36000,
    categoryId: "almuerzos",
    accent: "#9A3412",
  },
  {
    id: "alm-lomo-bbq",
    name: "Lomo de cerdo BBQ",
    description: "Con consomé, arroz y papa francesa.",
    price: 28000,
    categoryId: "almuerzos",
    accent: "#E8642C",
  },
  {
    id: "alm-filete-gratinado",
    name: "Filete gratinado",
    description: "Con consomé, arroz y papa francesa.",
    price: 28000,
    categoryId: "almuerzos",
    accent: "#A0522D",
  },

  // —— Ejecutivo (1) ——
  {
    id: "eje-menu-dia",
    name: "Almuerzo ejecutivo",
    description: "Menú diferente todos los días. Incluye consomé y limonada.",
    price: 18000,
    categoryId: "ejecutivo",
    accent: "#D4A017",
  },

  // —— Combos (4) ——
  {
    id: "combo-hamburguesa",
    name: "Combo hamburguesa",
    description: "Hamburguesa, papas y gaseosa o limonada natural.",
    price: 28000,
    categoryId: "combos",
    accent: "#8B4518",
  },
  {
    id: "combo-perro",
    name: "Combo perro",
    description: "Perro caliente, papas y gaseosa o limonada natural.",
    price: 28000,
    categoryId: "combos",
    accent: "#E8642C",
  },
  {
    id: "combo-sandwich",
    name: "Combo sándwich",
    description: "Sándwich, papas y gaseosa o limonada natural.",
    price: 28000,
    categoryId: "combos",
    accent: "#C4A574",
  },
  {
    id: "combo-pizza",
    name: "Combo pizza",
    description: "Pizza personal, papas y gaseosa o limonada natural.",
    price: 28000,
    categoryId: "combos",
    accent: "#7D1D1F",
  },

  // —— Entradas (6) ——
  {
    id: "ent-consome-especial",
    name: "Consomé especial",
    description: "Consomé de la casa.",
    price: 14000,
    categoryId: "entradas",
    accent: "#6B4226",
  },
  {
    id: "ent-consome-sencillo",
    name: "Consomé sencillo",
    description: "Consomé sencillo.",
    price: 11000,
    categoryId: "entradas",
    accent: "#5C3317",
  },
  {
    id: "ent-chicharron",
    name: "Chicharrón con arepa y limón",
    description: "Chicharrón, arepa y limón.",
    price: 14000,
    categoryId: "entradas",
    accent: "#9A3412",
  },
  {
    id: "ent-chorizo",
    name: "Chorizo con arepa y limón",
    description: "Chorizo, arepa y limón.",
    price: 11000,
    categoryId: "entradas",
    accent: "#7D1D1F",
  },
  {
    id: "ent-papas",
    name: "Papas a la francesa",
    description: "Porción de papas fritas.",
    price: 8000,
    categoryId: "entradas",
    accent: "#F2A541",
  },
  {
    id: "ent-arroz",
    name: "Porción de arroz",
    description: "Porción de arroz.",
    price: 6000,
    categoryId: "entradas",
    accent: "#C4A574",
  },

  // —— Asados cerdo y pollo (7) ——
  {
    id: "cp-filete-pollo",
    name: "Filete de pollo",
    description: "250 g con arroz y papa salada.",
    price: 34000,
    categoryId: "cerdo-pollo",
    accent: "#D4A017",
  },
  {
    id: "cp-lomo-cerdo",
    name: "Lomo de cerdo",
    description: "250 g con arroz y papa salada.",
    price: 34000,
    categoryId: "cerdo-pollo",
    accent: "#E8642C",
  },
  {
    id: "cp-costilla-bbq",
    name: "Costilla ahumada BBQ",
    description: "250 g con arroz y papa salada.",
    price: 34000,
    categoryId: "cerdo-pollo",
    accent: "#9A3412",
  },
  {
    id: "cp-costilla-cerdo",
    name: "Costilla de cerdo",
    description: "250 g con arroz y papa salada.",
    price: 34000,
    categoryId: "cerdo-pollo",
    accent: "#7D1D1F",
  },
  {
    id: "cp-chuleta-cerdo",
    name: "Chuleta de cerdo",
    description: "250 g con arroz y papa salada.",
    price: 34000,
    categoryId: "cerdo-pollo",
    accent: "#8B4518",
  },
  {
    id: "cp-chuleta-pollo",
    name: "Chuleta de pollo",
    description: "250 g con arroz y papa salada.",
    price: 34000,
    categoryId: "cerdo-pollo",
    accent: "#A0522D",
  },
  {
    id: "cp-chuleton",
    name: "Chuletón",
    description: "250 g con arroz y papa salada.",
    price: 34000,
    categoryId: "cerdo-pollo",
    accent: "#6B4226",
  },

  // —— Asados de res (4) ——
  {
    id: "res-churrasco",
    name: "Churrasco",
    description: "250 g con arroz y papa salada.",
    price: 40000,
    categoryId: "res",
    accent: "#E8642C",
  },
  {
    id: "res-punta-anca",
    name: "Punta de anca",
    description: "250 g con arroz y papa salada.",
    price: 44000,
    categoryId: "res",
    accent: "#7D1D1F",
  },
  {
    id: "res-asado-mixto",
    name: "Asado mixto",
    description:
      "Para 2 personas: costilla 350 g, filete de pollo 90 g, lomo de cerdo 90 g, chorizo, papas a la francesa y arepa.",
    price: 50000,
    categoryId: "res",
    accent: "#9A3412",
  },
  {
    id: "res-picada",
    name: "Picada",
    description:
      "Para 4 personas: costilla 350 g, filete de pollo 250 g, lomo de cerdo 250 g, chorizo, papas a la francesa, arepa y plátano.",
    price: 75000,
    categoryId: "res",
    accent: "#5C3317",
  },

  // —— Pizzas (7 sabores × personal / mediana) ——
  {
    id: "pizza-hawaiana-personal",
    name: "Pizza hawaiana personal",
    description: "Piña, jamón y queso.",
    price: 18000,
    categoryId: "pizzas",
    accent: "#F2A541",
  },
  {
    id: "pizza-hawaiana-mediana",
    name: "Pizza hawaiana mediana",
    description: "Piña, jamón y queso.",
    price: 35000,
    categoryId: "pizzas",
    accent: "#F2A541",
  },
  {
    id: "pizza-margarita-personal",
    name: "Pizza margarita personal",
    description: "Jamón y queso.",
    price: 18000,
    categoryId: "pizzas",
    accent: "#7D1D1F",
  },
  {
    id: "pizza-margarita-mediana",
    name: "Pizza margarita mediana",
    description: "Jamón y queso.",
    price: 35000,
    categoryId: "pizzas",
    accent: "#7D1D1F",
  },
  {
    id: "pizza-champipollo-personal",
    name: "Pizza champipollo personal",
    description: "Champiñón, pollo y queso.",
    price: 18000,
    categoryId: "pizzas",
    accent: "#C4A574",
  },
  {
    id: "pizza-champipollo-mediana",
    name: "Pizza champipollo mediana",
    description: "Champiñón, pollo y queso.",
    price: 35000,
    categoryId: "pizzas",
    accent: "#C4A574",
  },
  {
    id: "pizza-zamba-personal",
    name: "Pizza zamba personal",
    description: "Maduro, tocineta, maíz y queso.",
    price: 18000,
    categoryId: "pizzas",
    accent: "#D4A017",
  },
  {
    id: "pizza-zamba-mediana",
    name: "Pizza zamba mediana",
    description: "Maduro, tocineta, maíz y queso.",
    price: 35000,
    categoryId: "pizzas",
    accent: "#D4A017",
  },
  {
    id: "pizza-bbq-personal",
    name: "Pizza BBQ personal",
    description: "Tocineta, pollo, salsa BBQ y queso.",
    price: 18000,
    categoryId: "pizzas",
    accent: "#E8642C",
  },
  {
    id: "pizza-bbq-mediana",
    name: "Pizza BBQ mediana",
    description: "Tocineta, pollo, salsa BBQ y queso.",
    price: 35000,
    categoryId: "pizzas",
    accent: "#E8642C",
  },
  {
    id: "pizza-napolitana-personal",
    name: "Pizza napolitana personal",
    description: "Queso, tomate y orégano en polvo.",
    price: 18000,
    categoryId: "pizzas",
    accent: "#9A3412",
  },
  {
    id: "pizza-napolitana-mediana",
    name: "Pizza napolitana mediana",
    description: "Queso, tomate y orégano en polvo.",
    price: 35000,
    categoryId: "pizzas",
    accent: "#9A3412",
  },
  {
    id: "pizza-peperoni-personal",
    name: "Pizza peperoni personal",
    description: "Peperoni y queso.",
    price: 18000,
    categoryId: "pizzas",
    accent: "#8B4518",
  },
  {
    id: "pizza-peperoni-mediana",
    name: "Pizza peperoni mediana",
    description: "Peperoni y queso.",
    price: 35000,
    categoryId: "pizzas",
    accent: "#8B4518",
  },

  // —— Lasañas (3) ——
  {
    id: "las-champipollo",
    name: "Lasaña champipollo",
    description: "Pollo, champiñón y queso.",
    price: 27000,
    categoryId: "lasanas",
    accent: "#C4A574",
  },
  {
    id: "las-mixta",
    name: "Lasaña mixta",
    description: "Pollo, boloñesa y queso.",
    price: 27000,
    categoryId: "lasanas",
    accent: "#7D1D1F",
  },
  {
    id: "las-maiz-pollo",
    name: "Lasaña maíz con pollo",
    description: "Maíz, pollo y queso.",
    price: 27000,
    categoryId: "lasanas",
    accent: "#F2A541",
  },

  // —— Comidas rápidas (9) ——
  {
    id: "rap-burger-sencilla",
    name: "Hamburguesa sencilla",
    description: "Carne, tomate, lechuga, cebolla, queso, ripio y salsas.",
    price: 19000,
    categoryId: "rapidas",
    accent: "#8B4518",
  },
  {
    id: "rap-burger-especial",
    name: "Hamburguesa especial",
    description: "Carne, tomate, lechuga, cebolla, queso, tocineta, ripio y salsas.",
    price: 23000,
    categoryId: "rapidas",
    accent: "#E8642C",
  },
  {
    id: "rap-burger-doble",
    name: "Hamburguesa doble carne",
    description: "2 carnes, tomate, lechuga, cebolla, queso, tocineta, ripio y salsas.",
    price: 27000,
    categoryId: "rapidas",
    accent: "#7D1D1F",
  },
  {
    id: "rap-perro-sencillo",
    name: "Perro sencillo",
    description: "Salchicha, jamón, queso, cebolla, ripio y salsas.",
    price: 16000,
    categoryId: "rapidas",
    accent: "#A0522D",
  },
  {
    id: "rap-perro-especial",
    name: "Perro especial",
    description: "Salchicha, jamón, tocineta, queso, cebolla, ripio y salsas.",
    price: 20000,
    categoryId: "rapidas",
    accent: "#9A3412",
  },
  {
    id: "rap-sandwich-cubano",
    name: "Sándwich cubano",
    description: "Jamón, queso, lechuga y tomate.",
    price: 20000,
    categoryId: "rapidas",
    accent: "#C4A574",
  },
  {
    id: "rap-salchipapa-sencilla",
    name: "Salchipapa sencilla",
    description: "Papa a la francesa, salchicha, queso y salsas.",
    price: 20000,
    categoryId: "rapidas",
    accent: "#F2A541",
  },
  {
    id: "rap-salchipapa-especial",
    name: "Salchipapa especial",
    description: "Papa a la francesa, salchicha, ripio, tocineta, queso y salsas.",
    price: 25000,
    categoryId: "rapidas",
    accent: "#D4A017",
  },
  {
    id: "rap-salchipollo",
    name: "Salchipollo",
    description: "Papa a la francesa, salchicha, pollo, queso, maíz y salsas.",
    price: 25000,
    categoryId: "rapidas",
    accent: "#6B4226",
  },

  // —— Bebidas (15) ——
  {
    id: "beb-jugo-leche",
    name: "Jugo en leche",
    description: "Mora, lulo, mango, maracuyá o guanábana.",
    price: 8000,
    categoryId: "bebidas",
    accent: "#6B8E23",
  },
  {
    id: "beb-jugo-agua",
    name: "Jugo en agua",
    description: "Mora, lulo, mango, maracuyá o guanábana.",
    price: 7000,
    categoryId: "bebidas",
    accent: "#4A6741",
  },
  {
    id: "beb-jugo-hit",
    name: "Jugo Hit 500 ml",
    description: "Jugo Hit en botella.",
    price: 6000,
    categoryId: "bebidas",
    accent: "#F2A541",
  },
  {
    id: "beb-limonada-coco",
    name: "Limonada de coco",
    description: "Limonada cremosa de coco.",
    price: 9500,
    categoryId: "bebidas",
    accent: "#F5DEB3",
  },
  {
    id: "beb-limonada-cereza",
    name: "Limonada de cereza",
    description: "Limonada de cereza.",
    price: 9500,
    categoryId: "bebidas",
    accent: "#7D1D1F",
  },
  {
    id: "beb-limonada-natural",
    name: "Limonada natural",
    description: "Limonada natural.",
    price: 7000,
    categoryId: "bebidas",
    accent: "#6B8E23",
  },
  {
    id: "beb-agua-h2o",
    name: "Agua H2O",
    description: "Agua H2O.",
    price: 6000,
    categoryId: "bebidas",
    accent: "#1E3A5F",
  },
  {
    id: "beb-gatorade",
    name: "Gatorade",
    description: "Gatorade.",
    price: 6000,
    categoryId: "bebidas",
    accent: "#E8642C",
  },
  {
    id: "beb-te",
    name: "Té",
    description: "Té frío.",
    price: 6000,
    categoryId: "bebidas",
    accent: "#D4A017",
  },
  {
    id: "beb-gaseosa",
    name: "Gaseosa 400 ml",
    description: "Gaseosa 400 ml.",
    price: 5000,
    categoryId: "bebidas",
    accent: "#1E3A5F",
  },
  {
    id: "beb-agua",
    name: "Agua 500 ml",
    description: "Agua embotellada 500 ml.",
    price: 4000,
    categoryId: "bebidas",
    accent: "#4A6741",
  },
  {
    id: "beb-corona",
    name: "Corona",
    description: "Cerveza Corona.",
    price: 7000,
    categoryId: "bebidas",
    accent: "#F5DEB3",
  },
  {
    id: "beb-club-colombia",
    name: "Club Colombia",
    description: "Cerveza Club Colombia.",
    price: 7000,
    categoryId: "bebidas",
    accent: "#B8860B",
  },
  {
    id: "beb-aguila-light",
    name: "Águila Light",
    description: "Cerveza Águila Light.",
    price: 7000,
    categoryId: "bebidas",
    accent: "#F2A541",
  },
  {
    id: "beb-poker",
    name: "Poker",
    description: "Cerveza Poker.",
    price: 7000,
    categoryId: "bebidas",
    accent: "#8B4518",
  },
];

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getItemById(id: string): MenuItem | undefined {
  return items.find((item) => item.id === id);
}

/** Foto del plato: override del ítem → mapa por id → categoría → placeholder. */
export function getItemImage(item: MenuItem): string {
  const path =
    item.image ??
    ITEM_IMAGES[item.id] ??
    CATEGORY_IMAGES[item.categoryId] ??
    PLACEHOLDER_IMAGE;
  return withBase(path);
}

export function hasRealItemImage(item: MenuItem): boolean {
  const path =
    item.image ??
    ITEM_IMAGES[item.id] ??
    CATEGORY_IMAGES[item.categoryId] ??
    PLACEHOLDER_IMAGE;
  return path !== PLACEHOLDER_IMAGE;
}
