// import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';

// const DocumentCom = () => {
// 	const { task_id } = useParams();
// 	const [fileBase64String, setFileBase64String] = useState('');
// 	const viewer = useRef(null);
// 	const [docList, setDocList] = useState([]);

// 	useEffect(() => {
// 		fetch('documents.json')
// 			.then((res) => res.json())
// 			.then((data) => setDocList(data))
// 			.catch((err) => console.log(err));
// 	}, []);

// 	return (
// 		<div>
// 			<div className='webviewer' ref={viewer}></div>
// 		</div>
// 	);
// };

// export default DocumentCom;

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { usePdf } from '@mikecousins/react-pdf';

const documentsUrl = [
	{
		id: 1,
		url: 'https://arxiv.org/pdf/2212.08011.pdf',
	},
	{
		id: 2,
		url: 'https://arxiv.org/pdf/2212.07937.pdf',
	},
	{
		id: 3,
		url: 'https://arxiv.org/pdf/2212.07931.pdf',
	},
];

const DocumentCom = () => {
	// const [doc, setDoc] = useState({});
	const { id } = useParams();
	const doc = documentsUrl.find((d) => d.id === parseInt(id));
	// const [url, setUrl] = useState('');

	const [page, setPage] = useState(1);
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [highlight, setHighLight] = useState({});
	const [isDrawing, setIsDrawing] = useState(false);
	const [isTitleActive, setIsTitleActive] = useState(false);
	const [isAuthoreActive, setIsAuthoreActive] = useState(false);

	function refreshPage() {
		window.location.reload(false);
	}

	const canvasOffSetX = useRef(null);
	const canvasOffSetY = useRef(null);
	const startX = useRef(null);
	const startY = useRef(null);

	const savedhighlights = JSON.parse(localStorage.getItem('highlights'));
	useEffect(() => {
		const canvas = canvasRef.current;
		canvas.width = 595;
		canvas.height = 841;

		const context = canvas.getContext('2d');
		contextRef.current = context;

		const canvasOffSet = canvas.getBoundingClientRect();
		canvasOffSetX.current = canvasOffSet.left;
		canvasOffSetY.current = canvasOffSet.top;
	}, []);

	highlited();
	function highlited() {
		if (savedhighlights?.length > 0 && contextRef.current) {
			const documentAnotation = savedhighlights.filter(
				(item) => item.id === id
			);
			contextRef.current.globalAlpha = 0.2;
			documentAnotation.map((anotated) => {
				contextRef.current.fillStyle = anotated.color;
				contextRef.current?.fillRect(
					anotated.x,
					anotated.y,
					anotated.width,
					anotated.height
				);
			});
		}
	}

	const startDrawingRectangle = ({ nativeEvent }) => {
		if (isAuthoreActive || isTitleActive) {
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();

			startX.current = nativeEvent.clientX - canvasOffSetX.current;
			startY.current = nativeEvent.clientY - canvasOffSetY.current;

			setIsDrawing(true);
		}
	};

	const drawRectangle = ({ nativeEvent }) => {
		if (!isDrawing) {
			return;
		}

		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();

		const newMouseX = nativeEvent.clientX - canvasOffSetX.current;
		const newMouseY = nativeEvent.clientY - canvasOffSetY.current;

		const rectWidht = newMouseX - startX.current;
		const rectHeight = newMouseY - startY.current;

		contextRef.current.fillStyle = 'rgba(144, 255, 150, 0.2)';
		contextRef.current.globalAlpha = 0.3;

		contextRef.current.fillRect(
			startX.current,
			startY.current,
			rectWidht,
			rectHeight
		);
		let color;
		let name;
		if (isTitleActive) {
			color = 'red';
			name = 'Title';
		}
		if (isAuthoreActive) {
			color = 'blue';
			name = 'Author';
		}
		setHighLight({
			x: startX.current,
			y: startY.current,
			height: rectHeight,
			width: rectWidht,
			color: color,
			name,
			id,
		});
		return;
	};

	const stopDrawingRectangle = () => {
		const savedhighlights = JSON.parse(localStorage.getItem('highlights'));
		let highlights = [];
		if (!highlight.x) return;
		if (savedhighlights) {
			highlights = [...savedhighlights, highlight];
		} else {
			highlights = [highlight];
		}
		localStorage.setItem('highlights', JSON.stringify(highlights));

		setIsDrawing(false);
		refreshPage();
		return;
	};

	const activeTitleAnotate = (e) => {
		setIsTitleActive((prev) => !prev);

		setIsAuthoreActive(false);
		localStorage.setItem(
			'activeNotation',
			JSON.stringify({ isTitleActive: !isTitleActive, isAuthoreActive: false })
		);
	};
	const activeAuthoreAnotate = () => {
		setIsAuthoreActive((prev) => !prev);
		setIsTitleActive(false);

		localStorage.setItem(
			'activeNotation',
			JSON.stringify({
				isTitleActive: false,
				isAuthoreActive: !isAuthoreActive,
			})
		);
	};

	useEffect(() => {
		const activeNotation = JSON.parse(localStorage.getItem('activeNotation'));

		if (!activeNotation) return;
		setIsTitleActive(activeNotation.isTitleActive);
		setIsAuthoreActive(activeNotation.isAuthoreActive);
	}, []);

	const { pdfDocument, pdfPage } = usePdf({
		file: doc.url,
		page,
		canvasRef,
	});

	return (
		<>
			<div className='container'>
				<div className='left_container'>
					<div className=''>
						<h3>Labels</h3>
						<hr />
						<button
							className={`btn-title ${isTitleActive ? 'active' : ''}`}
							onClick={activeTitleAnotate}
						>
							Title
						</button>
						<button
							className={`btn-author ${isAuthoreActive ? 'active' : ''}`}
							onClick={activeAuthoreAnotate}
						>
							Authore
						</button>
					</div>
					<div className=''>
						<h3>Boxes</h3>
						<hr />
						<>
							{savedhighlights?.map((cord, idx) => (
								<div className='cord' key={idx}>
									<span>x: {cord.x}, </span>
									<span>y: {cord.y}, </span>
									<span>height: {cord.height}, </span>
									<span>widht: {cord.width}, </span>
									<span className={cord.name === 'Title' ? 'title' : 'author'}>
										{cord.name}
									</span>
								</div>
							))}
						</>
					</div>
				</div>
				<div className='main'>
					{!pdfDocument && <span>Loading...</span>}
					<canvas
						className='canvas-container'
						ref={canvasRef}
						onMouseDown={startDrawingRectangle}
						onMouseMove={drawRectangle}
						onMouseUp={stopDrawingRectangle}
						onMouseLeave={() => {
							stopDrawingRectangle();
						}}
					/>

					{/* {Boolean(pdfDocument && pdfDocument.numPages) && (
				<nav>
					<ul className='pager'>
						<li className='previous'>
							<button disabled={page === 1} onClick={() => setPage(page - 1)}>
								Previous
							</button>
						</li>
						<li className='next'>
							<button
								disabled={page === pdfDocument.numPages}
								onClick={() => setPage(page + 1)}
							>
								Next
							</button>
						</li>
					</ul>
				</nav>
			)} */}
				</div>
			</div>
		</>
	);
};

export default DocumentCom;
