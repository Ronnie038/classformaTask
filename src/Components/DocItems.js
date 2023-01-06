import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const DocItems = () => {
	const [docList, setDocList] = useState([]);
	console.log(docList);

	useEffect(() => {
		fetch('documents.json')
			.then((res) => res.json())
			.then((data) => setDocList(data))
			.catch((err) => console.log(err));
	}, []);

	return (
		<div>
			<div>
				<h4>Documents</h4>
				<hr />
				<ul>
					{docList?.map((doc, idx) => (
						<li key={idx}>
							<Link to={`/document/${doc.id}`}>Document - {idx + 1}</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default DocItems;
