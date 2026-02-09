export { renderers } from '../../../renderers.mjs';

const GET = async ({ cookies }) => {
  const sessionCookie = cookies.get("session");
  if (!sessionCookie) {
    return new Response(JSON.stringify({
      authenticated: false
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const session = JSON.parse(sessionCookie.value);
    return new Response(JSON.stringify({
      authenticated: true,
      user: {
        id: session.id,
        login: session.login,
        nombre: session.nombre,
        perfil: session.perfil
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({
      authenticated: false
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
