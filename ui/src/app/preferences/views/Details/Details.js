import { Col, Notification, Row } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";

import { auth as authActions, user as userActions } from "app/base/actions";
import {
  auth as authSelectors,
  user as userSelectors,
} from "app/base/selectors";
import { useAddMessage, useWindowTitle } from "app/base/hooks";
import { status as statusSelectors } from "app/base/selectors";
import UserForm from "app/base/components/UserForm";

export const Details = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(authSelectors.get);
  const usersSaved = useSelector(userSelectors.saved);
  const authUserSaved = useSelector(authSelectors.saved);
  const externalAuthURL = useSelector(statusSelectors.externalAuthURL);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const cleanup = () => {
    dispatch(authActions.cleanup());
    return userActions.cleanup();
  };

  useWindowTitle("Details");

  useAddMessage(
    usersSaved && (!passwordChanged || authUserSaved),
    cleanup,
    "Your details were updated successfully"
  );

  return (
    <>
      {externalAuthURL && (
        <Notification type="information">
          Users for this MAAS are managed using an external service
        </Notification>
      )}
      <Row>
        <Col size="4">
          <UserForm
            cleanup={cleanup}
            includeCurrentPassword
            includeUserType={false}
            onSaveAnalytics={{
              action: "Saved",
              category: "Details preferences",
              label: "Details form",
            }}
            onSave={(params, values, editing) => {
              dispatch(userActions.update(params));
              let passwordChanged =
                values.old_password ||
                values.password ||
                values.passwordConfirm;
              if (passwordChanged) {
                passwordChanged = true;
                dispatch(
                  authActions.changePassword({
                    old_password: values.old_password,
                    new_password1: values.password,
                    new_password2: values.passwordConfirm,
                  })
                );
              }
              setPasswordChanged(passwordChanged);
            }}
            user={authUser}
          />
        </Col>
      </Row>
    </>
  );
};

export default Details;
