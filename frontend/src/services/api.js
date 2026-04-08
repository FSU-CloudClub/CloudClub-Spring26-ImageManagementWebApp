let mockImages = [];

//create upload image func
export async function uploadImage(imageFile) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newImage = {
        id: Date.now(),
        name: imageFile.name,
        status: "PROCESSING",
        tags: [],
      };
      mockImages.push(newImage);
      setTimeout(() => {
        const image = mockImages.find((img) => img.id === newImage.id);
        if (image) {
          image.status = "COMPLETE";
          image.tags = ["dog", "animal", "pet"];
        }
      }, 5000);
      resolve(newImage);
    }, 1500);
  });
}
//create get images func
export async function getImages() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockImages);
    }, 500);
  });
}
//create delete images func
export async function deleteImage(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockImages = mockImages.filter((img) => img.id !== id);
      resolve({ success: true });
    }, 500);
  });
}

import { get } from "aws-amplify/api";

import { fetchAuthSession } from "aws-amplify/auth";

export const fetchImages = async () => {
  try {
    // 1. Get the session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/images`, {
      method: "GET",
      headers: {
        Authorization: token, // Some Cognito Authorizers hate the "Bearer" prefix
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Gallery request failed");

    const payload = await response.json();
    const images = Array.isArray(payload) ? payload : payload?.images || [];
    return { images };
  } catch (err) {
    console.error("Error fetching images:", err);
    throw err;
  }
};

//MELISSAS CODE FROM APP.JSX:

// export async function getImageStatus(imageId){
//     return new Promise((resolve)=>{
//         setTimeout(()=>{
//             const image = mockImages.find(img => img.id === imageId);
//             resolve(image);
//         },500);
//     });
// }

//  const [processing, setProcessing] = useState(false);
//   const [tags, setTags] = useState([]);

//   async function pollImageStatus(imageId) {
//     const interval = setInterval(async () => {
//       const data = await getImageStatus(imageId);

//       if (data.status === "COMPLETE") {
//         clearInterval(interval);
//         setProcessing(false);
//         setTags(data.tags);
//       }

//     }, 3000);
//   }

//   async function handleUpload(file) {
//     setProcessing(true);

//     const result = await uploadImage(file);
//     const imageId = result.id;

//     pollImageStatus(imageId);
//   }
{
  /* <input
    type="file"
    className="form-control mt-3"
    onChange={(e) => handleUpload(e.target.files[0])}
/>

<button className="btn btn-danger mt-3" onClick={signOut}>
    Sign Out
</button> */
}
