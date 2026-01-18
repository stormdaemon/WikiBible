-- Fonction SECURITY DEFINER pour contourner RLS sur user_scores
CREATE OR REPLACE FUNCTION upsert_user_score(
  p_user_id uuid,
  p_points integer,
  p_contributions_increment integer DEFAULT 1
) RETURNS jsonb AS $$
DECLARE
  v_current_total_hearts integer;
  v_new_total_hearts integer;
  v_new_contributions integer;
BEGIN
  -- Récupérer le score actuel
  SELECT total_hearts INTO v_current_total_hearts
  FROM user_scores
  WHERE user_id = p_user_id;

  IF v_current_total_hearts IS NOT NULL THEN
    -- Mise à jour du score existant
    v_new_total_hearts := GREATEST(0, v_current_total_hearts + p_points);
    v_new_contributions := (SELECT total_contributions FROM user_scores WHERE user_id = p_user_id) + p_contributions_increment;

    UPDATE user_scores
    SET
      total_hearts = v_new_total_hearts,
      total_contributions = v_new_contributions,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'action', 'updated',
      'user_id', p_user_id,
      'total_hearts', v_new_total_hearts,
      'total_contributions', v_new_contributions
    );
  ELSE
    -- Créer un nouveau score
    INSERT INTO user_scores (user_id, total_hearts, total_contributions, total_likes_received)
    VALUES (p_user_id, p_points, p_contributions_increment, 0);

    RETURN jsonb_build_object(
      'action', 'created',
      'user_id', p_user_id,
      'total_hearts', p_points,
      'total_contributions', p_contributions_increment
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
