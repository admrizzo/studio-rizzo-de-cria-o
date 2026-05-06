import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

interface WhatsAppQRProps {
  whatsapp: string;
  message?: string;
  size?: number;
}

const WhatsAppQR = ({ whatsapp, message = "", size = 120 }: WhatsAppQRProps) => {
  const url = `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="bg-white p-3 rounded-xl shadow-lg">
        <QRCodeSVG value={url} size={size} level="M" />
      </div>
      <p className="text-xs text-white/60">Escaneie para WhatsApp</p>
    </motion.div>
  );
};

export default WhatsAppQR;
