import { LocalNotifications } from '@ionic-native/local-notifications';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
// import { BackgroundMode } from '@ionic-native/background-mode';

declare var evothings: any;
declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  beaconData: any[] = [];
  // paused: boolean = false;

  constructor(private change: ChangeDetectorRef, 
              public navCtrl: NavController, 
              private platform: Platform,
              private localNotifications: LocalNotifications) {
      
       localNotifications.requestPermission();

       //To Set up Background Notification on Native
       let world = this;
       this.platform.ready().then(() => {
      
        cordova.plugins.backgroundMode.enable();
       
        cordova.plugins.backgroundMode.on(("activate"), function() {
          world.stopScanningForBeacons();
          world.backgroundRanging();
        });

        cordova.plugins.backgroundMode.on(("deactivate"), function() {
          console.log("DEACTIVATING");
          world.stopScanningForBeacons();
        });
       });
  }

  backgroundRanging(){
        evothings.eddystone.startScan((data) => {
          this.scheduleNotification(data.address);
          if (this.beaconData.length < 1){
            this.beaconData.push(data);
          } else {
            let found = false;
            this.beaconData.forEach((beacon, x) => {
              if (beacon.address == data.address){
                
                if (data.rssi < -90){
                  found = true;
                  // console.log("Too Far");
                  this.beaconData.splice(x, 1);
                  // console.log(this.beaconData);
                } else {
                  found = true;
                  this.beaconData[x] = data;
                }
              }
            });
            
            if (!found){
              this.beaconData.push(data);
              // this.beaconData.push(data);
            }
          }
          setTimeout(() => {
            this.change.detectChanges();
          }, 1000);
        }, error => console.error(error));
    }

  backgroundTesting(){
    console.log("Hello from background testing");
  }

  startScanningForBeacons(){
    this.platform.ready().then(() => {
      evothings.eddystone.startScan((data) => {
        if (this.beaconData.length < 1){
          this.beaconData.push(data);
        } else {
          let found = false;
          this.beaconData.forEach((beacon, x) => {
            if (beacon.address == data.address){
              
              if (data.rssi < -90){
                found = true;
                console.log("Too Far");
                this.beaconData.splice(x, 1);
                console.log(this.beaconData);
              } else {
                found = true;
                this.beaconData[x] = data;
              }
            }
          });

          
          if (!found){
            this.beaconData.push(data);
            // this.beaconData.push(data);
          }
        }
        setTimeout(() => {
          this.change.detectChanges();
        }, 1000);
      }, error => console.error(error));
    })
  }

  stopScanningForBeacons(){
    evothings.eddystone.stopScan();
  }

  scheduleNotification(beaconAddress){
    this.localNotifications.schedule({
      id: 1,
      text: 'Beacon Ho: ' + beaconAddress, 
    })
  }
}
