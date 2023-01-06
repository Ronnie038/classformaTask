import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import WebViewer from '@pdftron/webviewer';

const DocumentCom = () => {
	const { task_id } = useParams();
	const [fileBase64String, setFileBase64String] = useState('');
	const viewer = useRef(null);

	return (
		<div>
			<div className='webviewer' ref={viewer}></div>
		</div>
	);
};

export default DocumentCom;
