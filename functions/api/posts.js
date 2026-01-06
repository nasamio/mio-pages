export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
  
    try {
      if (id) {
        // 获取单篇文章详情
        const { results } = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).all();
        return Response.json(results[0] || {});
      } else {
        // 获取文章列表 (按时间倒序)
        const { results } = await env.DB.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
        return Response.json(results);
      }
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }