const env = (import.meta as any).env;
const URL_MENU = env?.VITE_MENU_URL || 'https://burger-menu-api.onrender.com';
const URL_ORDERS = env?.VITE_ORDER_URL || 'https://burger-order-api.onrender.com';

export const warmupServices = () => {
  const services = [
    { name: 'Menu Service', url: `${URL_MENU}/cardapio/ping` },
    { name: 'Order Service', url: `${URL_ORDERS}/pedidos/ping` }
  ];

  services.forEach(service => {
    fetch(service.url, { mode: 'no-cors' })
      .catch(() => {});
  });
};
