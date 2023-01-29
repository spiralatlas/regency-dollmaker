function firstElement(listname){
    //first element of the array listname
    return listname[0];
}

function setVariable(variablelist, number){
    //for every string in 'variablelist', set the portrait element with that name to have value 'number'
    for (let i = 0; i < variablelist.length; i += 1) {
        let b = findNameMatch(image_objects, variablelist[i]); //the eleemnt of image_objects with the right vriablename
        b.value_list=listOf(number);
        /*if (back_list.includes(b.name)){
            let b_back = findNameMatch(image_objects, b.name+"_back");//eg the object associated with "hat_back"
            let list = b_back.item_list;
            if (list.includes(b.item_list[number])){ //this is a valid type of back
                b_back.value_list=listOf(list.indexOf(b.item_list[number])); //set to the correct index, may not match the original object   
            } else{
                b_back.value_list=listOf(0); //set to none
            }
        }*/
    }
}

function setValuelist(variable, list){
    //for every string in 'variablelist', set the portrait element with that name to have value list 'list'
    let b = findNameMatch(image_objects, variable); //the eleemnt of image_objects with the right vriablename
    b.value_list=list;
}

function setColour(variablelist, colour){
    //for every string in 'variablelist', set the portrait element with that name to have colour1 'colour'
    for (let i = 0; i < variablelist.length; i += 1) {
        let b = findNameMatch(image_objects, variablelist[i]); //the eleemnt of image_objects with the right vriablename
        b.colour1=colour;
    }
}

function getOffset(name){
    //how much the portrait image with name 'name' is shifted up or down to match the head shape
    let obj = findNameMatch(image_objects, "head");
    let head = obj.item_list[obj.item];
    switch(head){
        case "round":
            if (torso_offset_list.includes(name))   
                return -9;
            if (["Nose","Nose_front", "Facial_hair"].includes(name))  
                return -3;
            if (["Mouth"].includes(name))  
                return -2;     
            break;
        case "jowly": 
        if (torso_offset_list.includes(name))   
            return -9;
        if (["Nose","Nose_front", "Facial_hair"].includes(name))  
            return -2;
        if (["Mouth"].includes(name))  
            return -1;     
    break;   
        case "oval":
        
            if (torso_offset_list.includes(name))   
                return -6;
            if (["Nose",,"Nose_front","Facial_hair"].includes(name))  
                return -2;
            if (["Mouth"].includes(name))  
                return -1;        
            break;
        case "medium":
            if (torso_offset_list.includes(name))   
                return -1;
            if (["Nose",,"Nose_front","Facial_hair"].includes(name))  
                return -1;
            break; 
        case "square":
            if (torso_offset_list.includes(name))   
                return -1;
            if (["Nose",,"Nose_front","Facial_hair"].includes(name))  
                return -1;
            break;     
        case "rectangular":  
            if (torso_offset_list.includes(name))   
                return 2;
            if (["Facial_hair"].includes(name))  
                return 4;
            if (["Nose",,"Nose_front","Facial_hair"].includes(name))  
                return -1;    
            if (["Mouth"].includes(name))  
                return 3;    
            break;     
        case "pointed":  
            if (torso_offset_list.includes(name))   
                return 2;
            if (["Facial_hair"].includes(name))  
                return 4;
            if (["Mouth"].includes(name))  
                return 3;    
            break;               
    }    
    return 0;    
}

add_children("head", skin_list);
add_children("wheelchair_front", ["wheelchair_back"]);
add_children("hat_front", ["hat_back"]);
add_children("hair_front", ["hair_back"]);

