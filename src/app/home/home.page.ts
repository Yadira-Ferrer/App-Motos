import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { TimeTableControl } from '../interfaces/interfaces';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  motoCount = 8;
  motoBusy = 0;
  timeTable: TimeTableControl[] = [];
  duration = 1; // Minuto

  constructor( public toastController: ToastController ) {
    this.setInitValues();
  }

  setInitValues() {
    let times = this.getHours(8,20,30);
    for ( let t of times ) {
      let ttc = { hour: t, status: 'medium', moto:false, timer:0, time:"", interval:undefined };
      this.timeTable.push(ttc);
    }
  }

  getHours(start: number, end: number, step: number) {
    const hours = [];

    let countStep = 60 / step;

    for(let hour = start; hour <= end; hour++) {
        hours.push(moment({ hour }).format('h:mm A'));
        if ( hour === end ) break; 
        for (let x = 1; x < countStep; x++) {
          hours.push(
            moment({
                hour,
                minute: (step * x)
            }).format('h:mm A')
          );
        }
    }
    return hours;
  }

  assignMoto( ttc ) {
    if ( this.motoBusy + 1 < this.motoCount && ttc.status === 'medium' ) {

      ttc.status = 'success';
      this.motoBusy++;
      this.startTimer( ttc );

    } else if ( ttc.status === 'success' ) {

      ttc.status = 'medium';
      ttc.time = "";
      clearInterval( ttc.interval );
      this.motoBusy--;
      this.changeButtonStatus('danger', 'medium');

    } else if ( ttc.status === 'danger' ) {
      this.presentToast('No hay motociclistas disponibles.');
    } else {

      ttc.status = 'success';
      this.motoBusy++;
      this.changeButtonStatus('medium','danger');
      this.startTimer( ttc );

    }
  }

  changeButtonStatus(current, next) {
    for ( let tt of this.timeTable ) 
      tt.status = ( tt.status === current ) ? next : tt.status; 
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      color: 'tertiary'
    });
    toast.present();
  }

  startTimer( ttc ) {
    clearInterval(ttc.interval);
    ttc.timer = this.duration * 60;
    this.updateTimeValue( ttc );
    ttc.interval = setInterval( () => {
      this.updateTimeValue( ttc );
    }, 1000);
  }

  updateTimeValue( ttc ) {
    let minutes: any = ttc.timer / 60;
    let seconds: any = ttc.timer % 60;
    
    minutes = String('0' + Math.floor(minutes)).slice(-2);
    seconds = String('0' + Math.floor(seconds)).slice(-2);

    const text = minutes + ':' + seconds;
    ttc.time = text;

    --ttc.timer;

    if ( ttc.timer < 0 ) {
      ttc.time = "";
      ttc.status = "medium";
      clearInterval(ttc.interval);
      this.motoBusy--;
    }
  }

}