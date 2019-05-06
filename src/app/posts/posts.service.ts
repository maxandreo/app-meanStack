import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

import {Post} from './post.model';
import {post} from 'selenium-webdriver/http';


@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {
  }

  // Fetch tout les posts inscrits dans la BD au lancement de l'app
  getPosts() {
    this.http
      .get<{ message: string, posts: any }>(
        'http://localhost:3000/api/posts'
      )
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath
          };
        });
      }))
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  // Fetch a single Post, peupler post-create.component
  getPost(id: string) {
    return this.http
      .get<{ _id: string, title: string, content: string, imagePath: string }>(
        'http://localhost:3000/api/posts/' + id
      );
  }

  // Add Post
  addPost(title: string, content: string, image: File) {
    // const post: Post = {id: null, title, content};
    const postData = new FormData(); // combiner text values et file values
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title); // `image` correspond dans le back à router.post("", multer({storage: storage}).single("image"),
    this.http
      .post<{ message: string, post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((responseData) => {
        const post: Post = {
          id: responseData.post.id,
          title,
          content,
          imagePath: responseData.post.imagePath
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        // Add a loading spinner quand un Post est ajouté
        this.router.navigate(['/']);
      });
  }

  // Update a Post
  updatePost(id: string, title: string, content: string, image: File | string) {
    // const post: Post = {id: id, title: title, content: content, imagePath: null};
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      const postData: Post = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      };
    }
    this.http
      .put(
        'http://localhost:3000/api/posts/' + id,
        postData
      )
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        const post: Post = {
          id: id,
          title: title,
          content: content,
          imagePath: ""
        };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        // Add a loading spinner quand un Post est ajouté
        this.router.navigate(['/']);
      });
  }

  // Delete Post
  deletePost(postId: string) {
    this.http.delete(
      'http://localhost:3000/api/posts/' + postId
    )
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
