// src/pages/documentDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SelectedMaterialDetails from "../sections/download/SelectedMaterialDetails";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const DocumentDetailPage = () => {
  const { documentId } = useParams();
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      const docRef = doc(db, "documents", documentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedMaterial({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    };

    fetchDocument();
  }, [documentId]);

  if (!selectedMaterial) {
    return <div>Loading...</div>;
  }

  return <SelectedMaterialDetails selectedMaterial={selectedMaterial} />;
};

export default DocumentDetailPage;
