let mockImages = [];

//create upload image func
export async function uploadImage(imageFile){
    return new Promise((resolve) => { 
        setTimeout(() => {
            const newImage = {
                id: Date.now(),
                name: imageFile.name,
                tags: ["demo-tag-1", "demo-tag-2"]
            };
            mockImages.push(newImage);
            resolve(newImage);
        }, 1500);
        });
}

//create get images func 
export async function getImages(){
    return new Promise((resolve) =>{
        setTimeout(() => {
            resolve(mockImages);
        }, 500);
    });
}
//create delete images func
export async function deleteImage(id){
    return new Promise((resolve) => {  
        setTimeout(()=> {
            mockImages = mockImages.filter(img =>img.id !== id);
            resolve({success : true});
        }, 500);
    });
}




