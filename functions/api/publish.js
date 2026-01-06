export async function onRequestPost(context) {
    const { env, request } = context;
    try {
      const body = await request.json();
      const { username, password, title, content } = body;
  
      // 1. 先验证权限 (简单查一下用户表)
      const { results: users } = await env.DB.prepare(
        "SELECT * FROM users WHERE username = ? AND password = ?"
      ).bind(username, password).all();
  
      if (!users || users.length === 0) {
        return Response.json({ error: "无权发布，请检查登录状态" }, { status: 401 });
      }
  
      // 2. 插入文章
      await env.DB.prepare(
        "INSERT INTO posts (title, content) VALUES (?, ?)"
      ).bind(title, content).run();
  
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }