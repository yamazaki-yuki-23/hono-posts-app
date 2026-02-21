import { Hono } from 'hono'
import { renderer } from './renderer'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'


const app = new Hono<{Bindings: {DB: D1Database}}>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

const createPostSchema = z.object({
  title: z.string(),
  body: z.string(),
})

app.post('/posts', zValidator('form',createPostSchema), async(c) => {
  const {title, body} = c.req.valid('form')
  const sql = 'INSERT INTO posts (title, body) VALUES (?, ?)'
  await c.env.DB.prepare(sql).bind(title, body).run()
  return c.redirect('/posts')
})

const PostForm = () => (
  <form method="post" action="/posts">
    <input type="text" name="title" placeholder="Title" required />
    <input type="text" name="body" placeholder="Body" required />
    <button type="submit">Create Post</button>
  </form>
)

type Post = {
  title: string
  body: string
}

const PostList = ({posts}: {posts: Post[]}) => (
  <div>
    {posts.map((post) => (
      <div>
        <div>Title: {post.title}</div>
        <div>Body: {post.body}</div>
        <hr />
      </div>
    ))}
  </div>
)

app.get('/posts', async (c) => {
  const posts = await c.env.DB.prepare('SELECT * FROM posts').all<Post>()
  return c.render(
    <div>
      <PostForm />
      <PostList posts={posts.results} />
    </div>
  )
})







export default app
