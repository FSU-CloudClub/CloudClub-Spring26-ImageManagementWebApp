import React, {useState, useEffect} from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

//import any API functions or compontents
import ImageGrid from '../components/ImageGrid';
import { getImages } from '../services/api';
import { resolveS3KeyToUrl } from '../utils/s3Resolver';

const GalleryScreen = ({user, signOut}) => {
    //any states can go here; you can think of them like variables :)
    const [loading, setLoading] = useState(false); //set loading to true for when the page first renders
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);

    //any data fetching goes here (e.g. first 20 user images if that is what you want displayed)

    //(the following comment is in the style of java-doc commentation, usually prominent in prod code environments)
    /**
     * To fetch data we always use the useEffect hook.
     * @async use a function within the hook that is async (faster)
     * @structure use a try catch block in case errors are thrown from API function
     * @array there should be a dependancy array at the end of the hoook that basically makes the hook run when changes in the dependancies occur (this is important)
     * */
    
    //Example hook 
    useEffect(() =>{
        //write/define the async helper function...but we still have to call it to run it
        const loadData = async () => {
            try
            {
                setLoading(true); //set loading to true so the UI will show "Rendering pictures"
                
                // Fetch the list of image objects (mocked or real from the API)
                const result = await getImages();
                
                // Convert each image's S3 Key into a viewable pre-signed URL using Storage.get / getUrl
                const imagesWithUrls = await Promise.all(
                    result.map(async (img) => {
                        // Use img.s3Key if the backend provides it, otherwise fallback to img.name for mock purposes
                        const keyToResolve = img.s3Key || img.name;
                        const presignedUrl = await resolveS3KeyToUrl(keyToResolve);
                        
                        return {
                            ...img,
                            url: presignedUrl // This sets the url property used by the ImageGrid
                        };
                    })
                );
                
                setImages(imagesWithUrls); // place the updated data in state
            } 
            catch (err)
            {
                console.error("Failed to load gallery data:", err);
                setError("Issue with the API.");
            }
            finally //will run after try/catch
            {
                setLoading(false);  //we want to make the UI not show loading text anymore (because it was set to true at page initialization)
            }
        };

        loadData();
    }, [user]); //change every time the user is changed, if empty the useEffect will only run once (MUST BE THERE IN EVERY CASE)

    //define what the UI will look like in all cases (loading, error, data was fetched)
    if(loading) return (
        <div className="text-center mt-5">
            <h4>Syncing with AWS...</h4>
            <ImageGrid loading={true} />
        </div>);
    if (error)  return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4">
                <h1>Gallery Page</h1>
            </header>

            <section className="content-area">
                {/* Pass data down to smaller components here */}
                {images.length > 0 ? (
                    <ImageGrid images={images} loading={false} />
                ) : (
                    <p>No images found. Upload some to see them here!</p>
                )}
            </section>
        </div>
    );

}

export default GalleryScreen;