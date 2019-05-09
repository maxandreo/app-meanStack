import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {PostsService} from '../posts.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Post} from '../post.model';
import {mimeType} from './mime-type.validator';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  post: Post;
  isLoading = false;
  // ReactiveForm
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;


  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {
  }

  // Différencier si l'on CREATE un Post ou si l'on EDIT un Post
  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null,
        {
          validators: [Validators.required, Validators.minLength(3)]
        }),
      content: new FormControl(null,
        {validators: [Validators.required]}),
      image: new FormControl(null, { asyncValidators: [mimeType]})
    });
    // Prépeupler le form si l'on EDIT un post
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        // Add a load spinner
        this.isLoading = true;
        // Load le post à éditer, remplir le form avec le post à éditer
        this.postsService.getPost(this.postId).subscribe(postData => {
          // Remove a load spinner
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath
          };
          // Iniatialize toutes les value du form si on a un post à EDITER
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
          this.imagePreview = this.post.imagePath;
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    // Cibler une seule value du form
    this.form.patchValue({image: file});
    // Get access to the image et informer que file a changé,
    // le réevaluer et le valider
    this.form.get('image').updateValueAndValidity();
    // console.log(file);
    // console.log(this.form);
    // Créer URL de l'img, la preview de l'img
    const reader = new FileReader();
    reader.onload = () => {

      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    // Add a load spinner
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
      console.log(this.form.value.image);
    }
    this.form.reset();
  }


}
