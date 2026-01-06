export async function onRequestPost(context) {
    // 1. 获取前端传来的数据
    const { request, env } = context;
    const body = await request.json();
    const { username, password } = body;
  
    // 2. 数据库操作：查询用户
    // env.DB 是我们在 Cloudflare 后台绑定的数据库变量名
    const { results } = await env.DB.prepare(
      "SELECT * FROM users WHERE username = ? AND password = ?"
    )
    .bind(username, password)
    .all();
  
    // 3. 判断结果
    if (results.length > 0) {
      // 查到了，登录成功
      return new Response(JSON.stringify({ 
        success: true, 
        user: results[0] 
      }), { headers: { 'Content-Type': 'application/json' } });
    } else {
      // 没查到，登录失败
      return new Response(JSON.stringify({ 
        error: "账号或密码错误" 
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }