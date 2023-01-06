import React, { useEffect, useState } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DocItems from './Components/DocItems';
import DocumentCom from './Components/Document';
import Main from './layout/Main';

const App = () => {
	const router = createBrowserRouter([
		{
			path: '/',
			element: <DocItems />,
		},
		{
			path: 'document/:task_id',
			loader: ({ params }) => {
				return params;
			},
			element: <DocumentCom />,
		},
	]);
	return (
		<div>
			<RouterProvider router={router} />
		</div>
	);
};

export default App;
