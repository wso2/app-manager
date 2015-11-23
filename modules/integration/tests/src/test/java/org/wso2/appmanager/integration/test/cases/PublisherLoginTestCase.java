/*
*Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*WSO2 Inc. licenses this file to you under the Apache License,
*Version 2.0 (the "License"); you may not use this file except
*in compliance with the License.
*You may obtain a copy of the License at
*
*http://www.apache.org/licenses/LICENSE-2.0
*
*Unless required by applicable law or agreed to in writing,
*software distributed under the License is distributed on an
*"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*KIND, either express or implied.  See the License for the
*specific language governing permissions and limitations
*under the License.
*/

package org.wso2.appmanager.integration.test.cases;

import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.wso2.appmanager.integration.utils.AppmTestConstants;
import org.wso2.carbon.automation.engine.context.AutomationContext;
import org.wso2.carbon.automation.engine.context.TestUserMode;
import org.wso2.carbon.automation.engine.context.beans.User;
import org.wso2.carbon.automation.test.utils.http.client.HttpRequestUtil;
import org.wso2.carbon.automation.test.utils.http.client.HttpResponse;

import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;

public class PublisherLoginTestCase {

    private static final String TEST_DESCRIPTION = "Verify login to App Manager Publisher";
    private String backEndUrl;
    private User adminUser;

    @BeforeClass(alwaysRun = true)
    public void startUp() throws Exception {
        AutomationContext appMServer = new AutomationContext(AppmTestConstants.APP_MANAGER,
                                                             TestUserMode.SUPER_TENANT_ADMIN);
        backEndUrl = appMServer.getContextUrls().getWebAppURLHttps();
        adminUser = appMServer.getSuperTenant().getTenantAdmin();
    }

    @Test(description = TEST_DESCRIPTION)
    public void testPublisherLogin() throws Exception {
        String userName = adminUser.getUserName();
        String password = adminUser.getPassword();

        Map<String, String> requestHeaders = new HashMap<String, String>();
        requestHeaders.put("Content-Type", "application/json");

        HttpResponse response = HttpRequestUtil.doPost(new URL(backEndUrl
                                                       + "/publisher/api/authenticate?action=login"
                                                       + "&username="
                                                       + userName
                                                       + "&password="
                                                       + password), "{}",
                                                       requestHeaders);

        assertTrue(response.getResponseCode() == 200, "Non 200 status code received.");
        String session = response.getHeaders().get(AppmTestConstants.SET_COOKIE);
        assertNotNull(session, "Session is null");
    }

    @AfterClass(alwaysRun = true)
    public void closeDown() throws Exception {

    }
}