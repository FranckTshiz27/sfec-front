import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class MessageDialogService {
  constructor() { }

  private defaultOptions() {
    return {
      buttonsStyling: false as const,
      customClass: {
        popup: 'app-swal-popup',
        title: 'app-swal-title',
        htmlContainer: 'app-swal-content',
        confirmButton: 'app-swal-confirm-btn',
        cancelButton: 'app-swal-cancel-btn',
      },
    };
  }

  error(message: string, title: string): void {
    Swal.fire({
      ...this.defaultOptions(),
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Ok',
    });
  }

   errorHtml(message: string, title: string): void {
    Swal.fire({
      ...this.defaultOptions(),
      title: title,
      html: message,
      icon: 'error',
      confirmButtonText: 'Ok',
    });
  }
  success(message: string, title: string): void {
    Swal.fire({
      ...this.defaultOptions(),
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Ok',
    });
  }

  warning(message: string, title: string): void {
    Swal.fire({
      ...this.defaultOptions(),
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Ok',
    });
  }

  info(message: string, title: string): void {
    Swal.fire({
      ...this.defaultOptions(),
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Ok',
    });
  }

  question(message: string, title: string): void {
    Swal.fire({
      ...this.defaultOptions(),
      title: title,
      text: message,
      icon: 'question',
      confirmButtonText: 'Ok',
      cancelButtonText: 'Annuler',
    });


  }

  questionConfirmationMessage(message: string, title: string, icon: SweetAlertIcon, messageConfirmation: string, messageCancel: string): void {

    const swalWithBootstrapButtons = Swal.mixin({
      ...this.defaultOptions(),
      customClass: {
        popup: 'app-swal-popup',
        title: 'app-swal-title',
        htmlContainer: 'app-swal-content',
        confirmButton: 'app-swal-confirm-btn',
        cancelButton: 'app-swal-cancel-btn'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: title,
      text: message,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: "Oui, Je confirme l'opération",
      cancelButtonText: "Non, Ignorer l'opération",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Opération effectuée',
          messageConfirmation,
          'success'
        )
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Opéeation annulée',
          messageCancel,
          'error'
        )
      }
    })

  }
}
