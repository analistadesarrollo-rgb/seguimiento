export { renderers } from '../../../renderers.mjs';

const POST = async ({ cookies }) => {
  cookies.delete("session", { path: "/" });
  return new Response(JSON.stringify({
    success: true,
    message: "Sesión cerrada correctamente"
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
