import React from 'react';

export default function SponsorLogo({ sponsor, isElementor }) {
	if (isElementor && Array.isArray(sponsor)) {
		return sponsor.map(
			({ url, logo }) =>
				logo &&
				logo?.url && (
					<div className="flex flex-col justify-center items-center my-1">
						<span className="text-xss mb-1 font-normal no-underline">
							Sponsored by
						</span>
						<a
							href={url.url}
							target="_blank"
							className="items-center font-sans rounded-full text-xss my-1 text-center text-darkBlue  font-extrabold">
							<img src={logo.url} alt="Sponsor for the section." />
						</a>
					</div>
				)
		);
	} else if (!isElementor) {
		const { url, img } = sponsor;
		return (
			<div className="flex flex-col justify-center ">
				<span className="text-xss mb-2 font-normal no-underline">
					Sponsored by
				</span>
				<a
					href={url}
					target="_blank"
					className="items-center font-sans rounded-full text-xss my-1 text-center text-darkBlue  font-extrabold">
					{img && (
						<img
							src={img}
							alt="Sponsor for the section."
							className="h-12 w-12"
						/>
					)}
				</a>
			</div>
		);
	}
}
