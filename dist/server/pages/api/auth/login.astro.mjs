import { q as query } from '../../../chunks/db_D5YtOHEy.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { login, password } = body;
    if (!login || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: "Usuario y contraseña son requeridos"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sql = `
            SELECT id, login, pass, nombre, perfil, activo 
            FROM bdpersona.tbusuario 
            WHERE login = ? AND pass = ? AND activo != 0
        `;
    const users = await query(sql, [login, password]);
    if (users.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Usuario o contraseña incorrectos"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const user = users[0];
    const sessionData = {
      id: user.id,
      login: user.login,
      nombre: user.nombre,
      perfil: user.perfil.trim().toUpperCase()
    };
    cookies.set("session", JSON.stringify(sessionData), {
      path: "/",
      httpOnly: true,
      secure: false,
      // Set to true in production with HTTPS
      maxAge: 60 * 60 * 8
      // 8 hours
    });
    return new Response(JSON.stringify({
      success: true,
      user: {
        nombre: user.nombre,
        perfil: user.perfil
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Error al iniciar sesión",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
