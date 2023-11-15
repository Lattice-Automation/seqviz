import { useEffect, useState } from "react";
import React = require("react");
import { Button, Modal, SemanticCOLORS } from "semantic-ui-react";

export const PrimerModal = (props) => {
    const [buttonRev, setButtonRev] = useState("Add Primers")
    const [buttonRevColor, setButtonRevColor] = useState("blue" as SemanticCOLORS)


    const handleButtonChangeRev = () => {
        if(buttonRev === 'Add Primers'){
            setButtonRevColor('red')
            setButtonRev('Remove Primers')
        }
        else{
            setButtonRevColor('blue')
            setButtonRev('Add Primers')
        }
    }

    useEffect(() => {
    
        setButtonRev('Add Primers');
        setButtonRevColor('blue');
    
    }, [props.data]);

    
    return (
        <div>
            <Modal
                open={props.open}
            >
                <Modal.Header>Primer Information</Modal.Header>
                <Modal.Content>
                  <p>Forward Primer Sequence: {props.data[0].seq}</p>
                  <p>Forward Primer Length: {props.data[0].seq.length} bp</p>
                  <p>Forward Primer GC Content: {props.data[0].GCContent}</p>
                  <p>Forward Primer Temp: {props.data[0].temp} °C</p>
                 
                  <br></br>
                  <p>Reverse Primer Sequence: {props.data[1].seq}</p>
                  <p>Reverse Primer Length: {props.data[1].seq.length} bp</p>
                  <p>Reverse Primer GC Content: {props.data[1].GCContent}</p>
                  <p>Reverse Primer Temp: {props.data[1].temp} °C</p>
                  <Button color={buttonRevColor} onClick={() => {
                    if(buttonRev === 'Remove Primers'){
                        props.removePrimers();
                    }
                    else{
                        props.addPrimers([props.data[0], props.data[1]]); 
                    }
                    handleButtonChangeRev()}}>{buttonRev}</Button>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={props.closeModal}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
    );
};