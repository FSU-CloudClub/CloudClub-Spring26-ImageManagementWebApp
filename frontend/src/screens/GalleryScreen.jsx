import React, {useState, useEffect} from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

//import any API functions or compontents
import ImageGrid from '../components/ImageGrid';

const GalleryScreen = ({user, signOut}) => {
    //any states can go here; you can think of them like variables :)
    const [loading, setLoading] = useState(false); //set loading to true for when the page first renders
    const [error, setError] = useState(null);

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
                //const result = await [insert API function call];
                //setData(result); place the data in a state so it can be used throughout the component (you'd have to declare this with the loading state variable)
            } 
            catch
            {
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
            <ImageGrid/>
        </div>);
    if (error)  return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4">
                <h1>Gallery Page</h1>
            </header>

            <section className="content-area">
                {/* Pass data down to smaller components here */}
                <p>Loaded Images</p>
            </section>
        </div>
    );

}

export default GalleryScreen;