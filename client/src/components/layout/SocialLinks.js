import React from 'react'
import classnames from 'classnames'

import LinkedInSvg from '../../assets/img/linkedin.svg'
import GithubSvg from '../../assets/img/github.svg'
import TwitterSvg from '../../assets/img/twitter.svg'

const SOCIAL_LINKS = [
	{
		name: `Github`,
		url: `https://github.com/aa-deet-eeya`,
		svg: GithubSvg,
	},
	{
		name: `Twitter`,
		url: `https://twitter.com/aadeeteeya`,
		svg: TwitterSvg,
	},
	{
		name: `LinkedIn`,
		url: `https://www.linkedin.com/in/aa-deet-eeya/`,
		svg: LinkedInSvg,
	},
]

function SocialLinkItem({ link }) {
	const { name, url, svg } = link

	return (
		<li className="ml-4">
			<a href={url}>
				<span className="sr-only">{name}</span>
				<img src={svg} alt={`${name} social link`} />
			</a>
		</li>
	)
}

export default function SocialLinks({ className }) {
	return (
		<ul className={classnames('list-reset', className)}>
			{SOCIAL_LINKS.map((link) => (
				<SocialLinkItem key={link.name} link={link} />
			))}
		</ul>
	)
}
