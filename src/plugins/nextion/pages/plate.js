require("babel-polyfill");
import abstract from "./abstract.js";
import lodash from "lodash";

export default class Plate extends abstract{


  constructor(screenManager){
    super(screenManager);

    this.currentViewID = 0;
  }

  async init(plate){
    await this.setScreen("plate");

    this.plate = plate;
    this.profiles = await this.nanoDLP.getProfiles();
    this.profile = this.profiles[lodash.findIndex(this.profiles, {ProfileID:this.plate.ProfileID})]

    this.setText("t0", this.plate.Path);
    this.setText("t1", `${this.profile.Title} (${this.profile.Depth}um)`);
    this.setText("t3", `${this.plate.TotalSolidArea}ml`);
    this.setText("t7", `${this.plate.LayersCount} layers`);
    
    this.addListener("click_b2", (e)=>{
      this.changePage("plates");
    });

    this.addListener("click_b9", async () => {
      await this.nanoDLP.command("/printer/start/"+this.plate.PlateID);
      this.changePage("home");
    });
    /*
    this.addListener("click_b12", (e)=>{
      this.set3DView(++this.currentViewID);
    });
    */
    this.gap = 100/(this.plate.LayersCount);
    
    this.addListener("number", (index)=>{
      index = Math.floor((index)/this.gap);
      this.setLayer(index);
    });
    
    await this.setLayer(1);
  }

  async set3DView(index){
    await this.setText("t12", "Loading ");
    var image = await this.manager.nanoDLP.getCurrentPlate3DView(this.plate.PlateID, this.currentViewID%4);
    await this.nextion.displayBlackWhiteImage(image, 153, 49, 167).catch(e => console.error(e));
  }


  async setLayer(index){
    this.index = index==0?1:index;
    
    await this.setText("t12", `Loading ${this.index}/${this.plate.LayersCount}`);
    this.setText("t9", "layer "+this.index+"/"+this.plate.LayersCount);
    let image = await this.nanoDLP.getCurrentPlateLayer(this.plate.PlateID, this.index)

    await this.nextion.displayBlackWhiteImage(image, 153, 49, 167).catch(e => console.error(e));
  }
}
