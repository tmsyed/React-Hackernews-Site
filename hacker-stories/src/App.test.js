import React from 'react';
import renderer from 'react-test-renderer';
import App, {Item, List, SearchForm, InputWithLabel} from './App';

describe('Item', () => {
  const item = {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  };

  it('renders all properties', () => {
    const component = renderer.create(<Item item={item} />);

    expect(component.root.findByType('a').props.href).toEqual('https://reactjs.org/');

    expect(
      component.root.findAllByProps({ children: 'Jordan Walke' })
      .length
      ).toEqual(1);
  });
});

describe('something truthy', () => {

  it('true to be true', () => {
    expect(true).toBe(true);
  });

  it('false to be false', () => {
    expect(false).toBe(false);
  });
});
