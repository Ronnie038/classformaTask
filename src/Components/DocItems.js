import React, { useEffect, useState, useRef } from 'react';

import { usePdf } from '@mikecousins/react-pdf';

const url = 'https://arxiv.org/pdf/2212.08011.pdf';

const DocItems = () => {
	const [page, setPage] = useState(1);
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [highlight, setHighLight] = useState({});

	const [isDrawing, setIsDrawing] = useState(false);

	function refreshPage() {
		window.location.reload(false);
	}
	console.log(contextRef);

	const canvasOffSetX = useRef(null);
	const canvasOffSetY = useRef(null);
	const startX = useRef(null);
	const startY = useRef(null);
	// console.log(canvasOffSetX, canvasOffSetY);
	// console.log(contextRef.current);

	const savedhighlights = JSON.parse(localStorage.getItem('highlights'));
	console.log(savedhighlights);
	useEffect(() => {
		const canvas = canvasRef.current;
		canvas.width = 595;
		canvas.height = 841;

		const context = canvas.getContext('2d');
		context.lineCap = 'round';

		context.lineWidth = 5;
		contextRef.current = context;

		const canvasOffSet = canvas.getBoundingClientRect();
		canvasOffSetX.current = canvasOffSet.left;
		canvasOffSetY.current = canvasOffSet.top;
	}, []);

	highlited();
	function highlited() {
		if (savedhighlights.length > 0 && contextRef.current) {
			contextRef.current.globalAlpha = 0.5;
			contextRef.current.fillStyle = 'rgba(144, 255, 150, 0.5)';
			savedhighlights.map((anotated) => {
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
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();

		startX.current = nativeEvent.clientX - canvasOffSetX.current;
		startY.current = nativeEvent.clientY - canvasOffSetY.current;

		setIsDrawing(true);
		highlited();
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
		// contextRef.current.clearRect(
		// 	0,
		// 	0,
		// 	canvasRef.current.width,
		// 	canvasRef.current.height
		// );

		contextRef.current.fillStyle = 'rgba(144, 255, 150, 0.2)';
		contextRef.current.globalAlpha = 0.3;

		contextRef.current.fillRect(
			startX.current,
			startY.current,
			rectWidht,
			rectHeight
		);
		setHighLight({
			x: startX.current,
			y: startY.current,
			height: rectHeight,
			width: rectWidht,
			color: 'red',
		});

		// contextRef.current.fillRect(startX.current, startY.current, rectWidht, 12);
	};

	const stopDrawingRectangle = () => {
		setIsDrawing(false);
		// highlited();
		const savedhighlights = JSON.parse(localStorage.getItem('highlights'));
		let highlights = [];
		if (savedhighlights) {
			highlights = [...savedhighlights, highlight];
		}
		localStorage.setItem('highlights', JSON.stringify(highlights));
	};

	const { pdfDocument, pdfPage } = usePdf({
		file: url,
		page,
		canvasRef,
	});

	return (
		<div className='main'>
			{!pdfDocument && <span>Loading...</span>}
			<canvas
				className='canvas-container'
				ref={canvasRef}
				onClick={() => {
					refreshPage();
					drawRectangle();
				}}
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
	);
};

export default DocItems;
