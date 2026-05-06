import React from "react";
import { Property } from "@/types/property";
import { motion } from "framer-motion";
import { Bed, Bath, Car, Maximize, MapPin, Check, ImageIcon } from "lucide-react";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

interface PropertyCardProps {
  property: Property;
  index: number;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (property: Property) => void;
}

const PropertyCard = ({ property, index, selectionMode, isSelected, onToggleSelect, onOpenDetail }: PropertyCardProps) => {
  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelect(property.id);
    } else {
      onOpenDetail(property);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`group card-cinema rounded-xl overflow-hidden relative cursor-pointer ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
      onClick={handleCardClick}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-black/50 backdrop-blur-sm text-white/60 hover:bg-black/70"}`}>
          {isSelected && <Check className="w-4 h-4" />}
        </div>
      )}

      <div className="relative h-48 sm:h-60 overflow-hidden">
        <img
          src={property.fotosSmall?.[0] || property.fotos[0]}
          alt={property.titulo}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground">
              {property.tipo}
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              ID {property.id.replace(/^[a-zA-Z]-/, "")}
            </span>
          </div>
          {property.preco > 0 && (
            <p className="text-white font-bold text-lg sm:text-2xl mt-1.5 sm:mt-2 drop-shadow-lg">{formatPrice(property.preco)}</p>
          )}
        </div>
        {property.destaque && (
          <div className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500 text-white">
            ★ Destaque
          </div>
        )}
        <div className="absolute top-3 right-3 text-xs text-white/60 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          {property.fotos.length}
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
        <h3 className="font-semibold text-sm sm:text-lg leading-tight text-foreground line-clamp-2 text-center">{property.titulo}</h3>
        <p className="text-muted-foreground text-xs flex items-center gap-1.5 line-clamp-1">
          <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
          {property.bairro}
        </p>

        <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-1 flex-wrap">
          {property.quartos > 0 && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-primary/50" />{property.quartos}</span>}
          {property.banheiros > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-primary/50" />{property.banheiros}</span>}
          {property.vagas > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-primary/50" />{property.vagas}</span>}
          {property.area > 0 && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-primary/50" />{property.area}m²</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
