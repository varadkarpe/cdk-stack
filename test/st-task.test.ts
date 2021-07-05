import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as StTask from '../lib/st-task-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new StTask.StTaskStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
