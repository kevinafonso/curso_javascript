// Troque pelo número real: código do país + DDD + número, só dígitos.
const WHATSAPP_NUMBER = "5516997013431";
const WHATSAPP_MESSAGE = "Olá, Humberto! Tudo bem? Vi o site da Humberto Esquadrias e  gostaria de solicitar um orçamento.";

const whatsappUrl =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

document.querySelectorAll(".js-whatsapp").forEach((link) => {
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noopener";
});

document.getElementById("year").textContent = new Date().getFullYear();
