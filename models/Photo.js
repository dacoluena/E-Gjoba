import Image from "next/image";
import React from "react";



const PhotoCard = ({url}) =>{
    return(
        <div> 
            <div>
                <Image src={url} alt='image' width={100} height={60} priority/>
            </div>
        </div>
       
        
    )
}
export default PhotoCard;