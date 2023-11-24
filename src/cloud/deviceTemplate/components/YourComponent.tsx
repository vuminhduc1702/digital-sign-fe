// YourComponent.tsx
import React, { useEffect, useState } from 'react'
import type { RuleChain } from '../api/component'
import { fetchRuleChains } from '../api/component'

export const YourComponent: React.FC = () => {
  const [ruleChains, setRuleChains] = useState<RuleChain[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRuleChains();
      console.info(data)
      setRuleChains(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Rule Chains</h1>
      <ul>
        {ruleChains.map((ruleChain) => (
          <li key={ruleChain.id.id}>
            Name: {ruleChain.name}, ID: {ruleChain.id.id}
          </li>
        ))}
      </ul>
    </div>
  );
};


