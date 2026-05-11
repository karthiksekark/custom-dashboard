import PropTypes from 'prop-types';
import './JiraLink.scss';

export default function JiraLink({ href, children, plain }) {
  if (!href) return <>{children}</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`jira-link${plain ? ' jira-link--plain' : ''}`}
    >
      {children}
    </a>
  );
}

JiraLink.propTypes = {
  href:     PropTypes.string,
  children: PropTypes.node.isRequired,
  plain:    PropTypes.bool,
};
