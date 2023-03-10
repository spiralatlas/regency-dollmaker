function checkRender(obj){
    //return false if object should not be rendered
    for (let i = 0; i < no_render_list.length; i += 1){
        if (obj.name == no_render_list[i][0]){
            if (no_render_list[i][1].includes(obj.item_list[obj.item]))
                return false
        }
        if (obj.name.includes("wheelchair") && findNameMatch(defining_objects,"wheelchair").value_list[0] ==0)
            return false;
    }        
    return true  
}

function setVariables(data_object){
    //transfer data from webpage/load file to internal javascript

    currently_editing = data_object.currently_editing; //which element of editing list we are editing
    current_expression = data_object.current_expression;
    current_clothing = data_object.current_clothing;
    current_accessory = data_object.current_accessory;
    current_imageType = data_object.current_imageType;

    size = data_object.size;
    current_eyetype = data_object.current_eyetype;
    isWeird = data_object.isWeird;
    

    for (let i = 0; i < defining_objects.length; i += 1){
        let json_obj = defining_objects[i];
        let alpine_obj = data_object.current_defining_objects[i];
        current_item = alpine_obj.name; 
        json_obj.value_list = alpine_obj.value_list
        json_obj.colour1 = alpine_obj.colour1
        json_obj.colour2 = alpine_obj.colour2
        for (let i = 0; i < json_obj.value_children.length; i += 1){
            image_objects[json_obj.value_children[i]].item = json_obj.value_list[current_expression];
        }
        for (let i = 0; i < json_obj.colour_children.length; i += 1){
            image_objects[json_obj.colour_children[i]].colour1 = json_obj.colour1;
        }
        for (let i = 0; i < json_obj.colour2_children.length; i += 1){
            image_objects[json_obj.colour2_children[i]].colour1 = json_obj.colour2;
        }
    }

    let chest_obj = findNameMatch(image_objects,"chest");
    let coat_obj = findNameMatch(image_objects,"coat");
    let overshirt_obj = findNameMatch(image_objects,"overshirt");
    let top_obj = findNameMatch(image_objects,"top");
    let bottom_obj = findNameMatch(image_objects,"bottom");
    let hair_front_obj = findNameMatch(image_objects,"hair_front");
    let hair_back_obj = findNameMatch(image_objects,"hair_back");

    //calculating chest
    if (chest_obj.item!=0){
        if (coat_obj.item !=0){
            if (no_chest_coat_list.includes(coat_obj.item_list[coat_obj.item]))
                chest_obj.item =0
            else{    
                chest_obj.colour1 = coat_obj.colour1
                chest_obj.item += 4
            }
        }
        else{
        if (overshirt_obj.item !=0){
            chest_obj.colour1 = overshirt_obj.colour1
        }
        else{
        if (top_obj.item !=0){
                chest_obj.colour1 = top_obj.colour1
                if (chest_obj.item ==3 && ["breeches","trousers", "low skirt"].includes(findImageItem("bottom")))
                    chest_obj.item=4
        }
        else
            chest_obj.colour1 = findNameMatch(image_objects,"head").colour1               
        }}    
    }

    //hide collars when wearing a jama coat
    if (coat_obj.item_list[coat_obj.item]=="jama")
        findNameMatch(image_objects,"top_collar").item=0;   

    //update images and offsets
    for (let i = 0; i < image_objects.length; i += 1){
        image_objects[i].crop = [0,0,full_width,full_height];
        image_objects[i].heightOffset = getHeightOffset(image_objects[i].name);
        image_objects[i].widthOffset = getWidthOffset(image_objects[i].name);
        if (!checkRender(image_objects[i]))
            image_objects[i].item = 0
    }

    //sprite height
    if (findNameMatch(defining_objects,"wheelchair").value_list[0] !=0){ //there's a wheelchair
        sprite_height = full_height - (5-size)*25 -165;
    } else{ //no wheelchair
        sprite_height = full_height - (5-size)*30;
    }

    //calculating crops

    if (!["none","wrap"].includes(findImageItem("coat")))
        top_obj.crop = [100,0,120,800];
    if (["dress jacket", "long jacket closed","jama"].includes(findImageItem("coat")))
        bottom_obj.crop = [100,0,100,800];
   
    let hat_string = findImageItem("hat");
    console.log(hat_string)
    if (hat_string=="top hat"){
        crop_box = [0,144+getHeightOffset(hair_front_obj.name),300,700];
        hair_front_obj.crop = crop_box;
        hair_back_obj.crop = crop_box;
    }
    if (hat_string=="turban"){
        crop_box =[0,137+getHeightOffset(hair_front_obj.name),300,700];
        hair_front_obj.crop = crop_box;
        hair_back_obj.crop = crop_box;
    }   
    
    //calculated from other variables
    /*let b;
    
    if (current_Facialhair<facial_hair_list_port.length){
        setVariable(["Facial_hair"], current_Facialhair);
        setVariable(["Stubble"], 0);
        } 
    else{ //stubble
        setVariable(["Facial_hair"], 0);
        setVariable(["Stubble"],1);
    }

    b = findNameMatch(image_objects, "Eyes");
    for (let i = 0; i < 10; i += 1) {
        b.value_list[i] = eye_type*eye_expression_list_port.length + eye_expressions[i];
    }*/

    fixSources();

    drawCanvas();
}

document.addEventListener('alpine:init', () => {
    Alpine.data('dropdown', (titleInput = "",valueNameInput = "", typeNameInput = "") => ({
        title: titleInput, //the name for this choice used in the webpage
        valueName: valueNameInput, //the value being set 
        typeName: typeNameInput, //extra info on the type of button

      dropbtn: {
        //Sets a variable in a list using a dropdown
          ['x-html']() {
            output = "";
            id = '"drop'+this.title+this.valueName+'"'
            if (this.title!="")
                output += '<label for='+id+'>'+this.title+'</label>: ';  
            switch(this.typeName){
                case 'body':
                    obj_index = findDefiningIndex(this.valueName);
                    objName = '$store.alpineData.current_defining_objects['+obj_index+'].value_list';
                    objList = 'defining_objects['+obj_index+'].item_list';
                    buttonName = objName+"[0]";
                    value = "listOf(index)";
                    break;
                case 'clothing':
                    obj_index = 'findDefiningIndex(clothing_names[$store.alpineData.current_clothing])';
                    objName = '$store.alpineData.current_defining_objects['+obj_index+'].value_list';
                    objList = 'defining_objects['+obj_index+'].item_list';
                    buttonName = objName+"[0]";
                    value = "listOf(index)";
                    break;   
                case 'accessory':
                    obj_index = 'findDefiningIndex(accessory_names[$store.alpineData.current_accessory])';
                    objName = '$store.alpineData.current_defining_objects['+obj_index+'].value_list';
                    objList = 'defining_objects['+obj_index+'].item_list';
                    buttonName = objName+"[0]";
                    value = "listOf(index)";
                    break;        
                case 'expression':
                    obj_index = findDefiningIndex(this.valueName);
                    objName = '$store.alpineData.current_defining_objects['+obj_index+'].value_list[current_expression]';
                    objList = 'defining_objects['+obj_index+'].item_list';
                    buttonName = objName;
                    value = "index";
                    break;    
                case 'simple':
                    objName = '$store.alpineData.'+this.valueName;
                    value = "index";
                    buttonName = objName;
                    switch(this.valueName){
                        case 'current_clothing':
                            objList = 'clothing_names';
                            break;
                        case 'current_accessory':
                            objList = 'accessory_names';
                            break;    
                        case 'current_expression':
                            objList = 'panel_list';
                            break;
                        case 'size':
                            objList = 'size_list';
                            break;
                        case 'current_eyetype': 
                            objList = 'eyetype_list';
                            break;   
                        case 'current_imageType': 
                            objList = 'imageType_list';
                            break;           

                    }
                    break;     
            }    
            
            
            output +='<button id='+id+' class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" x-text="niceString('+objList+'['+buttonName+'])"></button>';
            output +='<ul class="dropdown-menu"> <template x-for=" (preset, index) in '+objList+'">'; 
            output +='<li><button class="dropdown-item" x-on:click="'+objName+'='+value+';setVariables(Alpine.store(\'alpineData\'));" x-text="niceString(preset)"></a></li>'; 
            output +='</template></ul>' 
            
            return output;
          },
      },
      colourbtn: {
        //Sets a colour using the colour picker
        ['x-html']() {

            switch(this.typeName){
                case 'body':
                    objName = '$store.alpineData.current_defining_objects[findDefiningIndex(\''+this.valueName+'\')].colour1';
                    break;
                case 'clothing1':
                    objName = '$store.alpineData.current_defining_objects[findDefiningIndex('+this.valueName+'_names[$store.alpineData.current_'+this.valueName+'])].colour1';
                    break; 
                case 'clothing2':
                    objName = '$store.alpineData.current_defining_objects[findDefiningIndex('+this.valueName+'_names[$store.alpineData.current_'+this.valueName+'])].colour2';
                    break;        
            }    
            id = '"drop'+this.title+this.valueName+'"';
            output = '<label for='+id+'>'+this.title+'</label>: ';   
            output += '<input id='+id+' type="color" :value ="'+objName+'"  @input="'+objName+'=$event.target.value;setVariables(Alpine.store(\'alpineData\'));" :aria-label="colour_desc('+objName+')"/>'
            return output 
            },
        },
  }))
  //data used by the Alpine components on the webpage
  Alpine.store('alpineData', {

    dark_theme: true,
    currently_editing : 0,
    current_expression : 0,
    current_clothing : 0,
    current_accessory : 0,
    current_imageType : 0,

    size : 0,
    current_eyetype: 0,
    isWeird: false,

    current_defining_objects: [
        {"name":"body","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"gloves","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#E3313C","colour2":"#901E3B"},
        {"name":"top","value_list":[1,1,1,1,1,1,1,1,1,1],"colour1":"#901E3B","colour2":"#4C6BC2"},
        {"name":"bottom","value_list":[2,2,2,2,2,2,2,2,2,2],"colour1":"#FAE181","colour2":"#FAF1CF"},
        {"name":"overshirt","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#4C6BC2","colour2":"#FAE181"},
        {"name":"neckwear","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#43A92D","colour2":"#43A92D"},
        {"name":"coat","value_list":[4,4,4,4,4,4,4,4,4,4],"colour1":"#E3313C","colour2":"#7543BD"},
        {"name":"chest","value_list":[1,1,1,1,1,1,1,1,1,1],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"skull","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"head","value_list":[2,2,2,2,2,2,2,2,2,2],"colour1":"#CA783C","colour2":"#00FF00"},
        {"name":"ears","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"earrings","value_list":[3,3,3,3,3,3,3,3,3,3],"colour1":"#901E3B","colour2":"#91C639"},
        {"name":"nose","value_list":[1,1,1,1,1,1,1,1,1,1],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"complexion","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"cheeks","value_list":[0,0,0,0,0,1,0,0,0,0],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"mouth","value_list":[15,12,28,30,18,14,22,28,6,8],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"eyebrows","value_list":[7,11,4,16,11,1,4,2,18,0],"colour1":"#FF0000","colour2":"#00FF00"},
        {"name":"eyes","value_list":[0,2,5,7,5,4,6,8,3,0],"colour1":"#8334D8","colour2":"#00FF00"},
        {"name":"eyewear","value_list":[1,1,1,1,1,1,1,1,1,1],"colour1":"#FAF6E9","colour2":"#FAF1CF"},
        {"name":"hair_front","value_list":[2,2,2,2,2,2,2,2,2,2],"colour1":"#712A0D","colour2":"#00FF00"},
        {"name":"hat","value_list":[0,0,0,0,0,0,0,0,0,0],"colour1":"#E1748A","colour2":"#FAF1CF"},
        {"name":"wheelchair","value_list":[1,1,1,1,1,1,1,1,1,1],"colour1":"#4C6BC2","colour2":"#7543BD"}],

    fixAlpine() { //make the alpine components match the variables used by the javascript
    
        this.size= size;
        this.current_eyetype = current_eyetype;
        this.isWeird = isWeird;
        
        for (let i = 0; i < defining_objects.length; i += 1){
            let json_obj = defining_objects[i];
            current_item = json_obj.name; 
            this.current_defining_objects[i].value_list = json_obj.value_list;
            this.current_defining_objects[i].colour1 = json_obj.colour1;
            this.current_defining_objects[i].colour2 = json_obj.colour2;
        }        
    },

    randomiseBodyColouring(){
        //randomise the skin/eye/hair colour
        if (isWeird){
            this.current_defining_objects[findDefiningIndex("head")].colour1 = randomElement(skin_colours.concat(skin_colours_weird),0);
            this.current_defining_objects[findDefiningIndex("hair_front")].colour1 = randomElement(hair_colours.concat(hair_colours_weird),0);
            this.current_defining_objects[findDefiningIndex("eyes")].colour1 = randomElement(eye_colours.concat(eye_colours_weird),0);

        }else{
            this.current_defining_objects[findDefiningIndex("head")].colour1 = randomElement(skin_colours,0);
            this.current_defining_objects[findDefiningIndex("hair_front")].colour1 = randomElement(hair_colours,0);
            this.current_defining_objects[findDefiningIndex("eyes")].colour1 = randomElement(eye_colours,0);
            
        }
    },
    randomiseFeatures(gender){
        //randomise the nose/head/hairstyle etc
        // gender: 0 =androgynous, 1 =masculine, 2=feminine
        for (let i = 0; i < defining_objects.length; i += 1){
            if (["nose","head"].includes(defining_objects[i].name)){
                this.current_defining_objects[i].value_list = listOf(randomIndex(defining_objects[i].item_list,0));
            }
            if ("chest"==defining_objects[i].name){
                switch(gender){
                    case 0:
                        this.current_defining_objects[i].value_list = listOf(randomIndex(defining_objects[i].item_list,0.3));
                        break;
                    case 1:
                        this.current_defining_objects[i].value_list = listOf(0);
                        break;
                    case 2:
                        this.current_defining_objects[i].value_list = listOf(randomIndex(defining_objects[i].item_list,0));
                        break;    
                }
            }
        }
        this.size = randomIndex(size_list,0);
    },
    randomiseClothingColour(){
        //randomise all clothing colours
        let temp_list;
        if (Math.random()>0.5)
            temp_list = outfit_colours;
        else{
            temp_list = randomElement(scheme_list,0);
        }
            
        for(let i = 0; i < defining_objects.length; i++){
            if (outfit_list.includes(defining_objects[i].name)||accessory_list.includes(defining_objects[i].name)) {
                this.current_defining_objects[i].colour1 = randomElement(temp_list,0);
                this.current_defining_objects[i].colour2 = randomElement(temp_list,0);
            }
        }
    },
    randomiseClothingValue(gender){
        //set all clothing values including sleeve length
        // gender: 0 =androgynous, 1 =masculine, 2=feminine
        for (let i = 0; i < defining_objects.length; i += 1){
            if (outfit_list.includes(defining_objects[i].name)||accessory_list.includes(defining_objects[i].name)|| ["hair_front"].includes(defining_objects[i].name)) {
                var prob;
                if (accessory_list.includes(defining_objects[i].name)|| defining_objects[i].name=="wheelchair")//accessories less common
                    prob = 0.5;
                else{
                    if (["top","bottom","hair_front"].includes(defining_objects[i].name))
                        prob = -1;
                    else
                        prob = 0;    
                }
                switch(gender){
                    case 0:
                        this.current_defining_objects[i].value_list = listOf(randomIndex(defining_objects[i].item_list,prob));  
                        break;
                    case 1:
                        this.current_defining_objects[i].value_list = listOf(randomElement(defining_objects[i].item_list_m,prob));  
                        break;
                    case 2:
                        this.current_defining_objects[i].value_list = listOf(randomElement(defining_objects[i].item_list_f,prob));  
                        break;    
                }   
            }
        }
        
            
    },
    randomiseAll(gender){
        this.randomiseBodyColouring();
        this.randomiseClothingColour();
        this.randomiseFeatures(gender);
        this.randomiseClothingValue(gender);
    },
})
  })

function niceString(input){
    //the text to put in a button
    let output = input.toString();
    output = output.replace("_", " ");
    return output.charAt(0).toUpperCase()+output.slice(1)

}

function drawCanvas() {
    //draw the preview and export canvases
    
    //preview canvas
    if (testing)
        document.getElementById("closet").innerHTML = print_defining_objects()+print_image_objects();

    canvas_preview = document.getElementById("previewCanvas");
    canvas_sample = document.getElementById("sampleCanvas");
    canvas = document.getElementById("exportCanvas");

    ctx_preview = canvas_preview.getContext("2d");
    ctx_sample = canvas_sample.getContext("2d");
    ctx_export = canvas.getContext("2d");

    canvas_preview.height = sprite_height; //clears
    canvas_sample.height = canvas_sample.height;
    canvas.height = sprite_height; //clears

    //document.getElementById("closet").innerHTML = print_image_objects();
    //portrait preview

    preview_width=full_width;
    preview_height=sprite_height;

    //ctx_preview.fillStyle = "#FF0000";
    //ctx_preview.fillRect(0, 0, preview_width, preview_height);
    //ctx_preview.drawImage(portrait_back, 0, 0);
    for (let i = 0; i < image_objects.length; i += 1){
        let b = image_objects[i];
        if (b.item_list[b.item] !="none"){ 
            //ctx_preview.fillStyle = "#000000";
            //ctx_preview.fillText(b.name, 10, 10*i); 
            //ctx_preview.drawImage(b.base_image_list[0],0,0);
            draw_object(b,current_expression,b.colour1,ctx_preview, 0,0,b.widthOffset, -b.heightOffset,preview_width,preview_height);
        }
    }

    if (currently_editing==0){
        ctx_sample.drawImage(skin_image,0,0)
        ctx_sample.drawImage(eyes_image,250,0)
        ctx_sample.drawImage(hair_image,500,0)
    } else{
        if (currently_editing<3){
            ctx_sample.drawImage(schemes_image,125,0)
        }
        else{
            ctx_sample.clearRect(0,0,canvas_sample.width,canvas_sample.height)
        }
    }
    

    
    //main canvas
    let current_list = [];
    switch (current_imageType){
        case 0: 
            current_list =  body_list;
            break;
        case 1: 
            current_list =  expression_list;
            break; 
        case 2: 
            current_list =  all_clothes_list;
            break;        
    }
    
    for (let i = 0; i < image_objects.length; i += 1){
        let b = image_objects[i];
        if (b.item_list[b.item] !="none"){ 
            if (current_list.includes(b.name)) 
                if (current_imageType ==2 && body_list.includes(b.name))
                    undraw_object(b,current_expression,b.colour1,ctx_export, 0,0,b.widthOffset, -b.heightOffset,full_width,sprite_height);
                else
                    draw_object(b,current_expression,b.colour1,ctx_export, 0,0,b.widthOffset, -b.heightOffset,full_width,sprite_height);
        }
    }
    
}

function setup(){
    canvas = document.getElementById("exportCanvas");
    ctx_export = canvas.getContext("2d");
    canvas_preview = document.getElementById("previewCanvas");
    ctx_preview = canvas_preview.getContext("2d");

    document.getElementById('download').addEventListener('click', function(e) {
        // from https://fjolt.com/article/html-canvas-save-as-image

        let filename = "dollmaker_";
        switch(current_imageType){
            case 0:
                filename += "body";
                break;
            case 01:
                filename += "expression_"+panel_list[current_expression];
                break;
            case 2:
                filename += "outfit";
                break;   
        }   
        console.log(filename);              
        // Convert our canvas to a data URL
        let canvasUrl = canvas.toDataURL();
        // Create an anchor, and set the href value to our data URL
        const createEl = document.createElement('a');
        createEl.href = canvasUrl;
    
        // This is the name of our downloaded file
        createEl.download = filename;
    
        // Click the download button, causing a download, and then remove it
        createEl.click();
        createEl.remove();
    })
    
    checkFileAPI();
    Alpine.store('alpineData').randomiseAll(0);

    //fix variables
    setVariables(Alpine.store('alpineData'));
    Alpine.store('alpineData').fixAlpine();
    
    drawCanvas();
}
let portrait_back = new Image();
portrait_back.src = "images/bases/pattern/pix_pattern_argyle.png";

let hair_image = new Image();
hair_image.src = "images/render/swatches/hair.png"
let eyes_image = new Image();
eyes_image.src = "images/render/swatches/eyes.png"
let skin_image = new Image();
skin_image.src = "images/render/swatches/skin.png"
let outfit_image = new Image();
outfit_image.src = "images/render/swatches/outfit.png"
let schemes_image = new Image();
schemes_image.src = "images/render/swatches/schemes.png"

const off_canvas = new OffscreenCanvas(full_width, full_height);
const off_ctx = off_canvas.getContext("2d");
window.onload = setup;
var game = setInterval(drawCanvas, 500);//Update canvas every 100 miliseconds

//Some useful posts:
//https://github.com/ninique/Dollmaker-Script
//https://stackoverflow.com/questions/45187291/how-to-change-the-color-of-an-image-in-a-html5-canvas-without-changing-its-patte?rq=1
//https://stackoverflow.com/questions/24405245/html5-canvas-change-image-color
//https://stackoverflow.com/questions/9303757/how-to-change-color-of-an-image-using-jquery
//https://stackoverflow.com/questions/28301340/changing-image-colour-through-javascript
//https://stackoverflow.com/questions/32784387/javascript-canvas-not-redrawing
