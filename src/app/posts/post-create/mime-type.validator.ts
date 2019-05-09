import {AbstractControl} from '@angular/forms';
import {Observable, Observer, of} from 'rxjs';

export const mimeType = (control: AbstractControl)
  : Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (!control.value || typeof(control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const fileReaderObs = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener('loadend', () => {
        // Mime-type validation //
        // @ts-ignore
        const arr = new Uint8Array(fileReader.result).subarray(0, 4);
        // to get that file type, we need to read a certain pattern
        let header = '';
        let isValid = false;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        switch (header) {
          // type = 'image/png';
          case '89504e47':
            isValid = true;
            break;
          // type = 'image/jpeg';
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        // emit data avec l'Observer
        if (isValid) {
          observer.next(null); // return null means emit
        } else {
          observer.next({invalidMimeType: true});
        }
        observer.complete();
      });
      // allow us to access the Mime-type
      fileReader.readAsArrayBuffer(file);
    }
  );
  return fileReaderObs;
};
